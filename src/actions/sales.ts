"use server";

// import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";

// --- Customers (Third Parties) ---

export async function getCustomers() {
    try {
        const customers = await prisma.thirdParty.findMany({
            where: { isCustomer: true },
            orderBy: { name: "asc" },
        });
        return { success: true, data: customers };
    } catch (error) {
        return { success: false, error: "Failed to fetch customers" };
    }
}

export async function createCustomer(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;

    if (!name) return { success: false, error: "Name is required" };

    try {
        await prisma.thirdParty.create({
            data: {
                name,
                email,
                phone,
                address,
                isCustomer: true
            },
        });
        revalidatePath("/sales");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to create customer" };
    }
}

// --- Sales Orders ---

export async function getSalesOrders() {
    try {
        const orders = await prisma.order.findMany({
            where: { type: "SALE" },
            include: {
                thirdParty: true,
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });
        return { success: true, data: orders };
    } catch (error) {
        return { success: false, error: "Failed to fetch sales orders" };
    }
}

export async function createSalesOrder(customerId: string, items: { productId: string; quantity: number; unitPrice: number }[]) {
    try {
        const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

        await prisma.order.create({
            data: {
                type: "SALE",
                thirdPartyId: customerId,
                totalAmount,
                status: "PENDING",
                items: {
                    create: items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice
                    }))
                }
            }
        });
        revalidatePath("/sales");
        return { success: true };
    } catch (error) {
        console.error("Create Sales Order Error:", error);
        return { success: false, error: "Failed to create sales order" };
    }
}

// --- Quotes ---

export async function getQuotes() {
    try {
        const quotes = await prisma.quote.findMany({
            include: {
                thirdParty: true,
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });
        return { success: true, data: quotes };
    } catch (error) {
        return { success: false, error: "Failed to fetch quotes" };
    }
}

export async function createQuote(customerId: string, items: { productId: string; quantity: number; unitPrice: number }[]) {
    try {
        const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

        await prisma.quote.create({
            data: {
                thirdPartyId: customerId,
                totalAmount,
                status: "DRAFT",
                items: {
                    create: items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice
                    }))
                }
            }
        });
        revalidatePath("/sales/quotes");
        return { success: true };
    } catch (error) {
        console.error("Create Quote Error:", error);
        return { success: false, error: "Failed to create quote" };
    }
}

export async function updateQuoteStatus(id: string, status: string) {
    try {
        await prisma.quote.update({
            where: { id },
            data: { status }
        });
        revalidatePath("/sales/quotes");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update quote status" };
    }
}
