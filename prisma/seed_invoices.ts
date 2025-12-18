import { PrismaClient } from "@prisma/client";

import { PrismaLibSql } from '@prisma/adapter-libsql';


const adapter = new PrismaLibSql({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Starting Invoice Generation...");

    // 1. Fetch all Orders
    const orders = await prisma.order.findMany({
        include: {
            items: {
                include: {
                    product: true,
                    material: true
                }
            },
            thirdParty: true
        }
    });

    console.log(`Found ${orders.length} orders to process.`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const order of orders) {
        // Check if invoice already exists for this order (assuming we might link them later, but for now just check if we have an invoice for this thirdParty with same amount and date to avoid dupes if re-run)
        // Actually, since we don't have a direct link in schema yet (maybe), let's just create them. 
        // To be safe against re-runs, let's check if an invoice exists with the same amount, date, and thirdParty.

        const existingInvoice = await prisma.invoice.findFirst({
            where: {
                thirdPartyId: (order as any).thirdPartyId,
                totalAmount: order.totalAmount,
                issueDate: order.createdAt,
                type: order.type === "SALE" ? "SALES" : "PURCHASE"
            }
        });

        if (existingInvoice) {
            skippedCount++;
            continue;
        }

        const type = order.type === "SALE" ? "SALES" : "PURCHASE";

        // Create Invoice
        const invoice = await prisma.invoice.create({
            data: {
                type: type,
                status: "PAID", // Assuming historical data is paid
                issueDate: order.createdAt,
                dueDate: order.createdAt, // Same day for simplicity
                totalAmount: order.totalAmount,
                paidAmount: order.totalAmount,
                thirdPartyId: (order as any).thirdPartyId!,
                items: {
                    create: (order as any).items.map((item: any) => ({
                        description: item.product?.name || item.material?.name || "Item",
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.quantity * item.unitPrice
                    }))
                }
            }
        });

        // Create Payment
        await prisma.payment.create({
            data: {
                invoiceId: invoice.id,
                amount: order.totalAmount,
                method: "BANK_TRANSFER", // Default method
                date: order.createdAt
            }
        });

        createdCount++;
    }

    console.log(`Invoice Generation Complete.`);
    console.log(`Created: ${createdCount}`);
    console.log(`Skipped: ${skippedCount}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
