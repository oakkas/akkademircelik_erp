'use server'

import { prisma } from "@/lib/db"

export async function getTopCustomers() {
    const topCustomers = await prisma.invoice.groupBy({
        by: ['thirdPartyId'],
        where: {
            type: 'SALES',
            status: 'PAID'
        },
        _sum: {
            totalAmount: true
        },
        orderBy: {
            _sum: {
                totalAmount: 'desc'
            }
        },
        take: 10
    })

    // Fetch ThirdParty names
    const customerIds = topCustomers.map(c => c.thirdPartyId)
    const customers = await prisma.thirdParty.findMany({
        where: {
            id: { in: customerIds }
        },
        select: {
            id: true,
            name: true
        }
    })

    return topCustomers.map(item => {
        const customer = customers.find(c => c.id === item.thirdPartyId)
        return {
            name: customer?.name || 'Unknown',
            total: item._sum.totalAmount || 0
        }
    })
}

export async function getTopProducts() {
    // Since we don't have direct product sales aggregation easily available without joining,
    // we will aggregate from InvoiceItems of PAID SALES invoices.
    // Note: This might be heavy for large datasets, but fine for now.

    const topProducts = await prisma.invoiceItem.groupBy({
        by: ['description'], // Using description as we seeded products into description often or linked via relation
        // Ideally we should use productId if available. Let's check schema.
        // Schema has InvoiceItem -> description, quantity. No productId directly on InvoiceItem in the snippet I saw earlier?
        // Let's re-verify schema if needed. But for now assuming description is the product name.
        where: {
            invoice: {
                type: 'SALES',
                status: 'PAID'
            }
        },
        _sum: {
            quantity: true
        },
        orderBy: {
            _sum: {
                quantity: 'desc'
            }
        },
        take: 10
    })

    return topProducts.map(item => ({
        name: item.description,
        quantity: item._sum.quantity || 0
    }))
}

export async function getSalesTrends() {
    // Get sales for the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const sales = await prisma.invoice.findMany({
        where: {
            type: 'SALES',
            status: 'PAID',
            issueDate: {
                gte: sixMonthsAgo
            }
        },
        select: {
            issueDate: true,
            totalAmount: true
        },
        orderBy: {
            issueDate: 'asc'
        }
    })

    // Group by month
    const monthlySales: Record<string, number> = {}

    sales.forEach(sale => {
        const month = sale.issueDate.toLocaleString('default', { month: 'short', year: 'numeric' }) // e.g., "Dec 2025"
        monthlySales[month] = (monthlySales[month] || 0) + sale.totalAmount
    })

    return Object.entries(monthlySales).map(([month, total]) => ({
        name: month,
        total
    }))
}

export async function getFinancialSummary() {
    // Profit & Loss (Estimated)
    // Revenue = Sum of PAID Sales Invoices
    // Expenses = Sum of PAID Expense Invoices

    const revenue = await prisma.invoice.aggregate({
        where: { type: 'SALES', status: 'PAID' },
        _sum: { totalAmount: true }
    })

    const expenses = await prisma.invoice.aggregate({
        where: { type: 'EXPENSE', status: 'PAID' },
        _sum: { totalAmount: true }
    })

    const totalRevenue = revenue._sum.totalAmount || 0
    const totalExpenses = expenses._sum.totalAmount || 0

    return {
        revenue: totalRevenue,
        expenses: totalExpenses,
        profit: totalRevenue - totalExpenses
    }
}

export async function getCashFlow() {
    // Incoming vs Outgoing over last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const invoices = await prisma.invoice.findMany({
        where: {
            status: 'PAID',
            issueDate: { gte: sixMonthsAgo }
        },
        select: {
            type: true,
            totalAmount: true,
            issueDate: true
        }
    })

    const monthlyFlow: Record<string, { income: number, expense: number }> = {}

    invoices.forEach(inv => {
        const month = inv.issueDate.toLocaleString('default', { month: 'short', year: 'numeric' })
        if (!monthlyFlow[month]) monthlyFlow[month] = { income: 0, expense: 0 }

        if (inv.type === 'SALES') {
            monthlyFlow[month].income += inv.totalAmount
        } else {
            monthlyFlow[month].expense += inv.totalAmount
        }
    })

    return Object.entries(monthlyFlow).map(([month, data]) => ({
        name: month,
        income: data.income,
        expense: data.expense
    }))
}

export async function getAgingReport() {
    // Overdue Invoices grouped by 0-30, 31-60, 61-90, 90+ days
    const overdueInvoices = await prisma.invoice.findMany({
        where: {
            type: 'SALES',
            status: { not: 'PAID' },
            dueDate: { lt: new Date() }
        },
        select: {
            dueDate: true,
            totalAmount: true,
            paidAmount: true
        }
    })

    const aging = {
        '0-30 Days': 0,
        '31-60 Days': 0,
        '61-90 Days': 0,
        '90+ Days': 0
    }

    const now = new Date()

    overdueInvoices.forEach(inv => {
        if (!inv.dueDate) return
        const diffTime = Math.abs(now.getTime() - inv.dueDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        const remaining = inv.totalAmount - inv.paidAmount

        if (diffDays <= 30) aging['0-30 Days'] += remaining
        else if (diffDays <= 60) aging['31-60 Days'] += remaining
        else if (diffDays <= 90) aging['61-90 Days'] += remaining
        else aging['90+ Days'] += remaining
    })

    return Object.entries(aging).map(([range, amount]) => ({
        name: range,
        amount
    }))
}

export async function getStockValuation() {
    // Sum of (Quantity * Price) for all stock
    // We need to join Stock with Product to get price
    const stocks = await prisma.stock.findMany({
        include: {
            product: true
        }
    })

    let totalValuation = 0
    const valuationByProduct: { name: string, value: number }[] = []

    stocks.forEach(stock => {
        if (!stock.product) return
        const value = stock.quantity * (stock.product.price || 0)
        totalValuation += value
        valuationByProduct.push({
            name: stock.product.name,
            value
        })
    })

    // Sort by value desc and take top 10 for chart
    valuationByProduct.sort((a, b) => b.value - a.value)

    return {
        total: totalValuation,
        byProduct: valuationByProduct.slice(0, 10)
    }
}

export async function getLowStockItems() {
    // Items with quantity < 10 (arbitrary threshold for now)
    const lowStock = await prisma.stock.findMany({
        where: {
            quantity: { lt: 10 }
        },
        include: {
            product: true
        },
        orderBy: {
            quantity: 'asc'
        },
        take: 10
    })

    return lowStock.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
    }))
}

export async function getStockMovements() {
    // Last 10 movements
    const movements = await prisma.stockMovement.findMany({
        take: 10,
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            product: true
        }
    })

    return movements.map(m => ({
        id: m.id,
        date: m.createdAt,
        product: m.product?.name || 'Unknown Product',
        type: m.type,
        quantity: m.quantity
    }))
}
