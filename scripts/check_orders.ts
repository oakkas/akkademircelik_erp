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
    const negativeOrders = await prisma.order.findMany({
        where: {
            totalAmount: { lt: 0 }
        },
        take: 5
    });

    console.log(`Negative Orders Count: ${await prisma.order.count({ where: { totalAmount: { lt: 0 } } })}`);
    if (negativeOrders.length > 0) {
        console.log("Sample Negative Order:", negativeOrders[0]);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
