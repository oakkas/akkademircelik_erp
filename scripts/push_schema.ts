import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
    const sqlPath = path.join(process.cwd(), 'migration.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    // Split by semicolon to execute statements one by one, 
    // but be careful with triggers/functions. 
    // For simple schema push, splitting by ';' usually works if no complex logic.
    // Better: use client.executeMultiple if available or just execute the whole thing if supported.
    // LibSQL client supports executeMultiple.

    console.log('Executing migration...');
    try {
        await client.executeMultiple(sql);
        console.log('Migration successful!');
    } catch (e) {
        console.error('Migration failed:', e);
        process.exit(1);
    }
}

main();
