import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding ...')

    // Create Customers
    const customer1 = await prisma.thirdParty.create({
        data: {
            name: 'Acme Corp',
            email: 'contact@acme.com',
            phone: '555-0101',
            address: '123 Acme Way',
            taxId: 'TAX-12345',
            isCustomer: true,
            contacts: {
                create: [
                    {
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john@acme.com',
                        phone: '555-0102',
                        role: 'Purchasing Manager',
                    },
                ],
            },
        },
    })

    const customer2 = await prisma.thirdParty.create({
        data: {
            name: 'Globex Corporation',
            email: 'info@globex.com',
            phone: '555-0201',
            address: '456 Globex St',
            taxId: 'TAX-67890',
            isCustomer: true,
            contacts: {
                create: [
                    {
                        firstName: 'Jane',
                        lastName: 'Smith',
                        email: 'jane@globex.com',
                        phone: '555-0202',
                        role: 'CEO',
                    },
                ],
            },
        },
    })

    // Create Suppliers
    const supplier1 = await prisma.thirdParty.create({
        data: {
            name: 'Steel Supplies Inc',
            email: 'sales@steelsupplies.com',
            phone: '555-0301',
            address: '789 Steel Blvd',
            taxId: 'TAX-11223',
            isSupplier: true,
            contacts: {
                create: [
                    {
                        firstName: 'Bob',
                        lastName: 'Builder',
                        email: 'bob@steelsupplies.com',
                        phone: '555-0302',
                        role: 'Sales Rep',
                    },
                ],
            },
        },
    })

    const supplier2 = await prisma.thirdParty.create({
        data: {
            name: 'Alloy Distributors',
            email: 'orders@alloydist.com',
            phone: '555-0401',
            address: '321 Alloy Ave',
            taxId: 'TAX-44556',
            isSupplier: true,
        },
    })

    // Create Prospects
    const prospect1 = await prisma.thirdParty.create({
        data: {
            name: 'Future Tech',
            email: 'info@futuretech.com',
            phone: '555-0501',
            isProspect: true,
        },
    })

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
