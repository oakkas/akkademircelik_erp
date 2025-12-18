'use server';

import { prisma } from '@/lib/db';

export async function getDashboardStats() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // 1. Inventory Stats (Total Items in Stock for now, as Material has no price)
    const totalStock = await prisma.stock.aggregate({
        _sum: {
            quantity: true,
        },
    });

    // 2. Active Jobs (IN_PROGRESS)
    const activeJobsCount = await prisma.productionJob.count({
        where: {
            status: 'IN_PROGRESS',
        },
    });

    const lastMonthActiveJobs = await prisma.productionJob.count({
        where: {
            status: 'IN_PROGRESS',
            updatedAt: {
                gte: firstDayOfLastMonth,
                lte: lastDayOfLastMonth
            }
        }
    })


    // 3. Monthly Sales (Total Amount)
    const monthlySales = await prisma.order.aggregate({
        _sum: {
            totalAmount: true,
        },
        where: {
            type: 'SALE',
            createdAt: {
                gte: firstDayOfMonth,
            },
        },
    });

    const lastMonthSales = await prisma.order.aggregate({
        _sum: {
            totalAmount: true,
        },
        where: {
            type: 'SALE',
            createdAt: {
                gte: firstDayOfLastMonth,
                lte: lastDayOfLastMonth,
            },
        },
    });

    // 4. Pending Purchases (Count)
    const pendingPurchasesCount = await prisma.order.count({
        where: {
            type: 'PURCHASE',
            status: 'PENDING',
        },
    });

    const lastMonthPendingPurchases = await prisma.order.count({
        where: {
            type: 'PURCHASE',
            status: 'PENDING',
            createdAt: {
                gte: firstDayOfLastMonth,
                lte: lastDayOfLastMonth
            }
        }
    })

    return {
        inventory: {
            totalItems: totalStock._sum.quantity || 0,
            trend: 0 // Placeholder as we don't have historical stock snapshot
        },
        activeJobs: {
            count: activeJobsCount,
            trend: activeJobsCount - lastMonthActiveJobs // Simple difference
        },
        sales: {
            total: monthlySales._sum.totalAmount || 0,
            trend: (monthlySales._sum.totalAmount || 0) - (lastMonthSales._sum.totalAmount || 0)
        },
        purchasing: {
            count: pendingPurchasesCount,
            trend: pendingPurchasesCount - lastMonthPendingPurchases
        }
    };
}
