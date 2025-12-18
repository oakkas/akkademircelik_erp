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
    const expenses = await prisma.invoice.count({
        where: { type: 'EXPENSE' }
    });
    console.log(`Total Expenses: ${expenses}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
