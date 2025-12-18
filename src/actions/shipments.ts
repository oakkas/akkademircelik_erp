"use server";

// import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";

export async function getShipments(orderId?: string) {
    try {
        const where = orderId ? { orderId } : {};
        const shipments = await prisma.shipment.findMany({
            where,
            include: {
                order: true,
                thirdParty: true,
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });
        return { success: true, data: shipments };
    } catch (error) {
        return { success: false, error: "Failed to fetch shipments" };
    }
}

export async function createShipment(orderId: string, items: { productId: string; quantity: number; warehouseId?: string; lotNumber?: string; serialNumber?: string }[]) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { thirdParty: true }
        });

        if (!order || !order.thirdPartyId) {
            return { success: false, error: "Order not found or missing customer" };
        }

        await prisma.shipment.create({
            data: {
                orderId,
                thirdPartyId: order.thirdPartyId,
                status: "DRAFT",
                items: {
                    create: items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        warehouseId: item.warehouseId,
                        lotNumber: item.lotNumber,
                        serialNumber: item.serialNumber
                    }))
                }
            }
        });

        revalidatePath("/sales/shipments");
        revalidatePath(`/sales/orders/${orderId}`);
        return { success: true };
    } catch (error) {
        console.error("Create Shipment Error:", error);
        return { success: false, error: "Failed to create shipment" };
    }
}

export async function updateShipmentStatus(id: string, status: string, trackingNumber?: string) {
    try {
        const shipment = await prisma.shipment.findUnique({
            where: { id },
            include: { items: true }
        });

        if (!shipment) return { success: false, error: "Shipment not found" };

        await prisma.$transaction(async (tx) => {
            // If status changing to SHIPPED, deduct stock
            if (status === "SHIPPED" && shipment.status !== "SHIPPED") {
                for (const item of shipment.items) {
                    if (item.warehouseId && item.productId) {
                        // Find stock
                        const stock = await tx.stock.findFirst({
                            where: {
                                productId: item.productId,
                                warehouseId: item.warehouseId,
                                lotNumber: item.lotNumber || null,
                                serialNumber: item.serialNumber || null
                            }
                        });

                        if (stock) {
                            // Deduct
                            await tx.stock.update({
                                where: { id: stock.id },
                                data: { quantity: stock.quantity - item.quantity }
                            });

                            // Log movement
                            await tx.stockMovement.create({
                                data: {
                                    productId: item.productId,
                                    warehouseId: item.warehouseId,
                                    type: "OUT",
                                    quantity: item.quantity,
                                    reason: `Shipment #${shipment.id.slice(-6)}`,
                                    lotNumber: item.lotNumber,
                                    serialNumber: item.serialNumber
                                }
                            });
                        }
                    }
                }
            }

            await tx.shipment.update({
                where: { id },
                data: {
                    status,
                    trackingNumber
                }
            });
        });

        revalidatePath("/sales/shipments");
        return { success: true };
    } catch (error) {
        console.error("Update Shipment Status Error:", error);
        return { success: false, error: "Failed to update shipment status" };
    }
}
