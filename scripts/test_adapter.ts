import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log("URL:", url);
console.log("Token:", authToken ? "Set" : "Unset");



const adapter = new PrismaLibSql({
    url: url!,
    authToken: authToken,
});
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Connecting...");
    await prisma.$connect();
    console.log("Connected.");

    // Count invoices
    const count = await prisma.invoice.count();
    console.log("Invoice count:", count);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
