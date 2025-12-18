import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const filePath = path.join(process.cwd(), 'raports', 'Aylık cari satış raporu.xls');
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

console.log("Searching for 2140:");
for (const row of data as any[]) {
    if (Math.abs(row['Ciro'] - 2140) < 0.01) {
        console.log(`Found: Name=${row['Cari hesap adı']}, Ciro=${row['Ciro']}`);
    }
}
