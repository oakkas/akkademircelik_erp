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
    console.log("Checking for negative invoices...");
    const count = await prisma.invoice.count({
        where: { totalAmount: { lt: 0 } }
    });
    console.log(`Found ${count} negative invoices.`);

    if (count > 0) {
        console.log("Deleting negative invoices...");
        const result = await prisma.invoice.deleteMany({
            where: { totalAmount: { lt: 0 } }
        });
        console.log(`Deleted ${result.count} invoices.`);
    } else {
        console.log("No negative invoices found.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
