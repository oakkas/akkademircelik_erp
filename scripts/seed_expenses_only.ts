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

async function seedExpenses() {
    console.log('Seeding Expenses...');
    const expenseCount = await prisma.invoice.count({ where: { type: 'EXPENSE' } });
    if (expenseCount > 0) {
        console.log(`Expenses already seeded (${expenseCount}).`);
        // return; // Commented out to force retry if needed, or we can check logic
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

        // Check if invoice already exists for this expense
        const existingInvoice = await prisma.invoice.findFirst({
            where: {
                type: 'EXPENSE',
                totalAmount: debitAmount,
                items: {
                    some: { description: accountName }
                }
            }
        });

        if (existingInvoice) {
            // console.log(`Skipping existing expense: ${accountName}`);
            continue;
        }

        try {
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
            if (createdCount % 10 === 0) console.log(`Seeded ${createdCount} expenses...`);
            await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
        } catch (e) {
            console.error(`Error seeding expense ${accountName}:`, e);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Longer delay on error
        }
    }
    console.log(`Seeded ${createdCount} expenses total.`);
}

async function main() {
    await seedExpenses();
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
