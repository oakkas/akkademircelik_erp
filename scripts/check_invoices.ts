import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaLibSql({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

async function main() {
    const invoices = await prisma.invoice.findMany();
    console.log(`Total Invoices: ${invoices.length}`);

    const salesInvoices = invoices.filter(i => i.type === 'SALES');
    console.log(`Sales Invoices: ${salesInvoices.length}`);

    const paidSalesInvoices = salesInvoices.filter(i => i.status === 'PAID');
    console.log(`Paid Sales Invoices: ${paidSalesInvoices.length}`);

    const totalRevenue = paidSalesInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
    console.log(`Total Revenue (Calculated): ${totalRevenue}`);

    if (paidSalesInvoices.length > 0) {
        console.log("Sample Paid Sales Invoice:", paidSalesInvoices[0]);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
