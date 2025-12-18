import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

import { PrismaLibSql } from '@prisma/adapter-libsql';


const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
console.log("TURSO_DATABASE_URL:", url ? "Set" : "Unset");
console.log("TURSO_AUTH_TOKEN:", authToken ? "Set" : "Unset");

const adapter = new PrismaLibSql({
    url: url!,
    authToken: authToken,
});
const prisma = new PrismaClient({ adapter });

const REPORTS_DIR = path.join(process.cwd(), 'raports');

async function main() {
    console.log('Starting data import...');

    // 1. Clear existing data
    console.log('Clearing existing data...');
    await prisma.shipmentItem.deleteMany();
    await prisma.shipment.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.quoteItem.deleteMany();
    await prisma.quote.deleteMany();
    await prisma.stockMovement.deleteMany();
    await prisma.stock.deleteMany();
    await prisma.bOMItem.deleteMany();
    await prisma.billOfMaterial.deleteMany();
    await prisma.routingStep.deleteMany();
    await prisma.routing.deleteMany();
    await prisma.jobOperation.deleteMany();
    await prisma.jobConsumption.deleteMany();
    await prisma.productionJob.deleteMany();
    await prisma.product.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.invoiceItem.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.thirdParty.deleteMany();
    // Keep Warehouses or ensure at least one exists
    const warehouseCount = await prisma.warehouse.count();
    if (warehouseCount === 0) {
        await prisma.warehouse.create({
            data: { name: 'Main Warehouse', address: 'Bursa' }
        });
    }
    const mainWarehouse = await prisma.warehouse.findFirst();

    console.log('Data cleared.');

    // 2. Import Products and ThirdParties from Transaction Files
    const salesFile = path.join(REPORTS_DIR, 'Genel  satış stok hareket föyü.xlsx');
    const purchaseFile = path.join(REPORTS_DIR, 'Genel alış stok hareket föyü.xlsx');

    const products = new Map<string, { name: string, price: number }>(); // code -> {name, price}
    const thirdParties = new Map<string, { name: string, isCustomer: boolean, isSupplier: boolean }>(); // name -> {name, isCustomer, isSupplier}

    // Helper to process file
    function processFile(filePath: string, isSales: boolean) {
        if (!fs.existsSync(filePath)) {
            console.warn(`File not found: ${filePath}`);
            return [];
        }
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        const orders = new Map<string, any>(); // key -> order data

        for (const row of data as any[]) {
            // Product
            const productCode = row['STOK KODU'];
            const productName = row['STOK İSMİ'];
            const price = row['NET BİRİM FİYATI'] || 0;

            if (productCode && productName) {
                if (!products.has(productCode)) {
                    products.set(productCode, { name: productName, price: Number(price) });
                }
            }

            // ThirdParty
            const tpName = row['CARİ İSMİ'];
            if (tpName) {
                const existing = thirdParties.get(tpName) || { name: tpName, isCustomer: false, isSupplier: false };
                if (isSales) existing.isCustomer = true;
                else existing.isSupplier = true;
                thirdParties.set(tpName, existing);
            }

            // Order Grouping
            // Filter for invoices/delivery notes
            const docType = row['EVRAK TİPİ'];
            if (docType === 'Giriş faturası' || docType === 'Çıkış irsaliyesi' || docType === 'Satış Faturası' || docType === 'Toptan Satış Faturası') {
                const series = row['FATURA SERİ'] || row['SERİ'] || '';
                const sequence = row['FATURA SIRA NO'] || row['SIRA NO'] || '';
                const orderKey = `${series}-${sequence}`;

                if (!orders.has(orderKey)) {
                    orders.set(orderKey, {
                        key: orderKey,
                        date: row['TARİH'] ? new Date(row['TARİH']) : new Date(),
                        tpName: tpName,
                        items: []
                    });
                }

                orders.get(orderKey).items.push({
                    productCode: productCode,
                    quantity: Number(row['MİKTAR'] || 0),
                    unitPrice: Number(price)
                });
            }
        }
        return Array.from(orders.values());
    }

    console.log('Processing Sales File...');
    const salesOrdersData = processFile(salesFile, true);
    console.log('Processing Purchase File...');
    const purchaseOrdersData = processFile(purchaseFile, false);

    // 3. Seed Products
    console.log(`Seeding ${products.size} Products...`);
    const productMap = new Map<string, string>(); // code -> dbId
    for (const [code, p] of products) {
        try {
            const created = await prisma.product.create({
                data: {
                    name: p.name, // We might want to include code in name or description if schema doesn't have code
                    description: code, // Storing code in description for now
                    price: p.price
                }
            });
            productMap.set(code, created.id);

            // Create initial stock (optional, but good for testing)
            // await prisma.stock.create({
            //     data: {
            //         warehouseId: mainWarehouse!.id,
            //         productId: created.id,
            //         quantity: 100 // Arbitrary initial stock
            //     }
            // });
        } catch (e) {
            console.error(`Error creating product ${p.name}:`, e);
        }
    }

    // 4. Seed ThirdParties
    console.log(`Seeding ${thirdParties.size} ThirdParties...`);
    const tpMap = new Map<string, string>(); // name -> dbId
    for (const [name, tp] of thirdParties) {
        try {
            const created = await prisma.thirdParty.create({
                data: {
                    name: tp.name,
                    isCustomer: tp.isCustomer,
                    isSupplier: tp.isSupplier
                }
            });
            tpMap.set(name, created.id);
        } catch (e) {
            console.error(`Error creating third party ${name}:`, e);
        }
    }

    // 5. Seed Orders
    console.log(`Seeding ${salesOrdersData.length} Sales Orders...`);
    for (const orderData of salesOrdersData) {
        const tpId = tpMap.get(orderData.tpName);
        if (!tpId) continue;

        const totalAmount = orderData.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);

        try {
            await prisma.order.create({
                data: {
                    type: 'SALE',
                    status: 'COMPLETED', // Assuming historical data is completed
                    totalAmount: totalAmount,
                    createdAt: orderData.date,
                    thirdPartyId: tpId,
                    items: {
                        create: orderData.items.map((item: any) => ({
                            productId: productMap.get(item.productCode),
                            quantity: Math.abs(item.quantity), // Ensure positive
                            unitPrice: item.unitPrice
                        })).filter((i: any) => i.productId) // Skip if product not found
                    }
                }
            });
        } catch (e) {
            console.error(`Error creating sales order ${orderData.key}:`, e);
        }
    }

    console.log(`Seeding ${purchaseOrdersData.length} Purchase Orders...`);
    for (const orderData of purchaseOrdersData) {
        const tpId = tpMap.get(orderData.tpName);
        if (!tpId) continue;

        const totalAmount = orderData.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);

        try {
            await prisma.order.create({
                data: {
                    type: 'PURCHASE',
                    status: 'COMPLETED',
                    totalAmount: totalAmount,
                    createdAt: orderData.date,
                    thirdPartyId: tpId,
                    items: {
                        create: orderData.items.map((item: any) => ({
                            productId: productMap.get(item.productCode),
                            quantity: Math.abs(item.quantity),
                            unitPrice: item.unitPrice
                        })).filter((i: any) => i.productId)
                    }
                }
            });
        } catch (e) {
            console.error(`Error creating purchase order ${orderData.key}:`, e);
        }
    }

    console.log('Data import completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
