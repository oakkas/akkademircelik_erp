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
    const order = await prisma.order.findUnique({
        where: { id: 'cmjblb1eh05jhrsjp6fpuaw2l' }
    });
    console.log("Order:", order);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
