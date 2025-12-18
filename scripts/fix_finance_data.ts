import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaLibSql({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

const RAPORTS_DIR = path.join(process.cwd(), 'raports');

async function cleanOrphanedInvoices() {
    console.log('Cleaning orphaned invoices...');
    const invoices = await prisma.invoice.findMany({
        where: { orderId: { not: null } },
        select: { id: true, orderId: true }
    });

    let deletedCount = 0;
    for (const invoice of invoices) {
        if (!invoice.orderId) continue;
        const order = await prisma.order.findUnique({ where: { id: invoice.orderId } });
        if (!order) {
            await prisma.invoice.delete({ where: { id: invoice.id } });
            deletedCount++;
        }
    }
    console.log(`Deleted ${deletedCount} orphaned invoices.`);
}

async function cleanDuplicateInvoices() {
    console.log('Cleaning duplicate invoices...');
    const invoices = await prisma.invoice.findMany({
        where: { orderId: { not: null } },
        orderBy: { createdAt: 'desc' }
    });

    const seenOrderIds = new Set<string>();
    let deletedCount = 0;

    for (const invoice of invoices) {
        if (!invoice.orderId) continue;
        if (seenOrderIds.has(invoice.orderId)) {
            await prisma.invoice.delete({ where: { id: invoice.id } });
            deletedCount++;
        } else {
            seenOrderIds.add(invoice.orderId);
        }
    }
    console.log(`Deleted ${deletedCount} duplicate invoices.`);
}

async function seedMissingInvoices() {
    console.log('Seeding missing invoices...');
    const orders = await prisma.order.findMany({
        include: { items: true }
    });

    let createdCount = 0;
    for (const order of orders) {
        const existingInvoice = await prisma.invoice.findFirst({ where: { orderId: order.id } });
        if (existingInvoice) continue;

        const invoiceType = order.type === 'SALE' ? 'SALES' : 'PURCHASE';
        const status = order.type === 'SALE' ? 'PAID' : 'PENDING';
        const paidAmount = order.type === 'SALE' ? order.totalAmount : 0;

        await prisma.invoice.create({
            data: {
                type: invoiceType,
                thirdPartyId: order.thirdPartyId!,
                orderId: order.id,
                status: status,
                issueDate: order.createdAt,
                dueDate: new Date(order.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000),
                totalAmount: order.totalAmount,
                paidAmount: paidAmount,
                items: {
                    create: order.items.map(item => ({
                        description: 'Order Item',
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.quantity * item.unitPrice
                    }))
                }
            }
        });
        createdCount++;
    }
    console.log(`Created ${createdCount} missing invoices.`);
}

async function seedExpenses() {
    console.log('Seeding Expenses...');
    // Check if expenses already exist to avoid duplicates
    const expenseCount = await prisma.invoice.count({ where: { type: 'EXPENSE' } });
    if (expenseCount > 0) {
        console.log(`Expenses already seeded (${expenseCount}). Skipping.`);
        return;
    }

    const filePath = path.join(RAPORTS_DIR, 'Masraf durum raporu.xls');
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    let createdCount = 0;
    for (const row of data as any[]) {
        const accountName = row['Hesap adı'];
        const debitAmount = row['TL Borç'];

        if (!accountName || !debitAmount || typeof debitAmount !== 'number' || debitAmount <= 0) continue;

        const thirdParty = await prisma.thirdParty.upsert({
            where: { id: `expense_${accountName.replace(/\s+/g, '_').substring(0, 20)}` },
            update: {},
            create: {
                id: `expense_${accountName.replace(/\s+/g, '_').substring(0, 20)}`,
                name: accountName,
                isSupplier: true,
            }
        });

        await prisma.invoice.create({
            data: {
                type: 'EXPENSE',
                thirdPartyId: thirdParty.id,
                status: 'PAID',
                issueDate: new Date(),
                totalAmount: debitAmount,
                paidAmount: debitAmount,
                items: {
                    create: {
                        description: accountName,
                        quantity: 1,
                        unitPrice: debitAmount,
                        totalPrice: debitAmount
                    }
                }
            }
        });
        createdCount++;
    }
    console.log(`Seeded ${createdCount} expenses.`);
}

async function main() {
    await cleanOrphanedInvoices();
    await cleanDuplicateInvoices();
    await seedMissingInvoices();
    await seedExpenses();
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
