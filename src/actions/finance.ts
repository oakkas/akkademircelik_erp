"use server";

// import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";

// --- Invoices ---

export async function getInvoices(type?: 'SALES' | 'PURCHASE') {
    try {
        const whereClause: any = {};
        if (type) whereClause.type = type;

        const invoices = await prisma.invoice.findMany({
            where: whereClause,
            include: { thirdParty: true, items: true, payments: true },
            orderBy: { issueDate: "desc" },
        });
        return { success: true, data: invoices };
    } catch (error) {
        return { success: false, error: "Failed to fetch invoices" };
    }
}

export async function createInvoice(formData: FormData) {
    const type = formData.get("type") as string;
    const thirdPartyId = formData.get("thirdPartyId") as string;
    const issueDate = new Date(formData.get("issueDate") as string);
    const dueDate = formData.get("dueDate") ? new Date(formData.get("dueDate") as string) : null;

    // Items are passed as JSON string in a hidden field for simplicity in this MVP
    // In a real app, we might use a more complex form submission or API endpoint
    const itemsJson = formData.get("items") as string;

    console.log("Creating Invoice:", { type, thirdPartyId, issueDate, dueDate, itemsJson });

    let items;
    try {
        items = JSON.parse(itemsJson);
    } catch (e) {
        console.error("Failed to parse items JSON:", e);
        return { success: false, error: "Invalid items data" };
    }

    if (!type || !thirdPartyId || !items || items.length === 0) {
        console.error("Missing required fields:", { type, thirdPartyId, itemsLength: items?.length });
        return { success: false, error: "Missing required fields" };
    }

    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);

    try {
        await prisma.invoice.create({
            data: {
                type,
                thirdPartyId,
                issueDate,
                dueDate,
                totalAmount,
                status: "DRAFT",
                items: {
                    create: items.map((item: any) => ({
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.quantity * item.unitPrice
                    }))
                }
            },
        });
        revalidatePath("/finance");
        revalidatePath("/finance/invoices");
        return { success: true };
    } catch (error) {
        console.error("Prisma Error:", error);
        return { success: false, error: "Failed to create invoice: " + (error as Error).message };
    }
}

// --- Payments ---

export async function registerPayment(invoiceId: string, amount: number, method: string) {
    try {
        const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
        if (!invoice) return { success: false, error: "Invoice not found" };

        const newPaidAmount = invoice.paidAmount + amount;
        let newStatus = invoice.status;

        if (newPaidAmount >= invoice.totalAmount) {
            newStatus = "PAID";
        } else if (newPaidAmount > 0) {
            newStatus = "PARTIALLY_PAID";
        }

        await prisma.$transaction([
            prisma.payment.create({
                data: {
                    invoiceId,
                    amount,
                    method,
                }
            }),
            prisma.invoice.update({
                where: { id: invoiceId },
                data: {
                    paidAmount: newPaidAmount,
                    status: newStatus
                }
            })
        ]);

        revalidatePath("/finance");
        revalidatePath("/finance/invoices");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to register payment" };
    }
}
