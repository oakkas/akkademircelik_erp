"use server";

// import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";

// --- Suppliers (Third Parties) ---

export async function getSuppliers() {
    try {
        const suppliers = await prisma.thirdParty.findMany({
            where: { isSupplier: true },
            orderBy: { name: "asc" },
        });
        return { success: true, data: suppliers };
    } catch (error) {
        return { success: false, error: "Failed to fetch suppliers" };
    }
}

export async function createSupplier(formData: FormData) {
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
                isSupplier: true
            },
        });
        revalidatePath("/purchasing");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to create supplier" };
    }
}

// --- Purchase Orders ---

export async function getPurchaseOrders() {
    try {
        const orders = await prisma.order.findMany({
            where: { type: "PURCHASE" },
            include: {
                thirdParty: true,
                items: {
                    include: {
                        material: true,
                        product: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });
        return { success: true, data: orders };
    } catch (error) {
        return { success: false, error: "Failed to fetch purchase orders" };
    }
}

export async function createPurchaseOrder(supplierId: string, items: { materialId: string; quantity: number; unitPrice: number }[]) {
    try {
        const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

        await prisma.$transaction(async (tx) => {
            // 1. Create Order
            const order = await tx.order.create({
                data: {
                    type: "PURCHASE",
                    thirdPartyId: supplierId,
                    totalAmount,
                    status: "COMPLETED", // Auto-complete for now, or we can have a receiving process
                    items: {
                        create: items.map(item => ({
                            materialId: item.materialId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice
                        }))
                    }
                }
            });

            // 2. Update Inventory (Auto-receive for simplicity for now, or we can make this a separate step)
            for (const item of items) {
                await tx.material.update({
                    where: { id: item.materialId },
                    data: { quantity: { increment: Number(item.quantity) } }
                });

                await tx.stockMovement.create({
                    data: {
                        materialId: item.materialId,
                        type: "IN",
                        quantity: item.quantity,
                        reason: `Purchase Order #${order.id.slice(-6)}`
                    }
                });
            }
        });

        revalidatePath("/purchasing");
        revalidatePath("/inventory");
        return { success: true };
    } catch (error) {
        console.error("Create Purchase Order Error:", error);
        return { success: false, error: "Failed to create purchase order" };
    }
}
