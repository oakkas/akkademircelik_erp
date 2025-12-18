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
    const negativeInvoices = await prisma.invoice.findMany({
        where: {
            totalAmount: { lt: 0 }
        },
        take: 5
    });

    console.log(`Negative Invoices Count: ${await prisma.invoice.count({ where: { totalAmount: { lt: 0 } } })}`);
    if (negativeInvoices.length > 0) {
        console.log("Sample Negative Invoice:", negativeInvoices[0]);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
