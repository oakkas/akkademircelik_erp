import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
    console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
    process.exit(1);
}

const client = createClient({
    url,
    authToken,
});

async function main() {
    const sqlPath = path.join(process.cwd(), "migration.sql");
    const sqlContent = fs.readFileSync(sqlPath, "utf-8");

    // Split by semicolon, but be careful with triggers/etc if any. 
    // For simple CREATE TABLE, splitting by ';' is usually fine.
    // Filter out empty statements.
    const statements = sqlContent
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

    console.log(`Found ${statements.length} statements to execute.`);

    for (const statement of statements) {
        try {
            await client.execute(statement);
            console.log("Executed statement.");
        } catch (e) {
            console.error("Error executing statement:", e);
            // Don't exit, try next (might be dependency issue, but usually CREATE TABLE order matters)
            // Actually, if it fails, it's bad.
            console.error("Statement:", statement);
            process.exit(1);
        }
    }

    console.log("Migration complete.");
}

main();
