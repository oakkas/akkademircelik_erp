"use server";

// import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";

export type MaterialState = {
    errors?: {
        name?: string[];
        type?: string[];
        thickness?: string[];
        width?: string[];
        length?: string[];
        quantity?: string[];
        minStock?: string[];
        _form?: string[];
    };
    message?: string;
};

export async function getMaterials() {
    try {
        const materials = await prisma.material.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                stocks: {
                    include: { warehouse: true }
                }
            }
        });
        return { success: true, data: materials };
    } catch (error) {
        return { success: false, error: "Failed to fetch materials" };
    }
}

export async function getWarehouses() {
    try {
        const warehouses = await prisma.warehouse.findMany({
            orderBy: { createdAt: "asc" }
        });
        return { success: true, data: warehouses };
    } catch (error) {
        return { success: false, error: "Failed to fetch warehouses" };
    }
}

export async function createWarehouse(name: string, address?: string) {
    try {
        await prisma.warehouse.create({
            data: { name, address }
        });
        revalidatePath("/inventory/warehouses");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to create warehouse" };
    }
}

async function getDefaultWarehouse() {
    let warehouse = await prisma.warehouse.findFirst();
    if (!warehouse) {
        warehouse = await prisma.warehouse.create({
            data: { name: "Main Warehouse", address: "Default Location" }
        });
    }
    return warehouse;
}

export async function createMaterial(
    prevState: MaterialState,
    formData: FormData
): Promise<MaterialState> {
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const thickness = parseFloat(formData.get("thickness") as string);
    const width = parseFloat(formData.get("width") as string);
    const length = parseFloat(formData.get("length") as string);
    const quantity = parseInt(formData.get("quantity") as string) || 0;
    const minStock = parseInt(formData.get("minStock") as string);

    // Basic validation
    if (!name || !type) {
        return {
            errors: {
                _form: ["Name and Type are required."],
            },
        };
    }

    try {
        const warehouse = await getDefaultWarehouse();

        await prisma.$transaction(async (tx) => {
            const material = await tx.material.create({
                data: {
                    name,
                    type,
                    thickness,
                    width,
                    length,
                    minStock,
                },
            });

            if (quantity > 0) {
                await tx.stock.create({
                    data: {
                        materialId: material.id,
                        warehouseId: warehouse.id,
                        quantity: quantity
                    }
                });

                await tx.stockMovement.create({
                    data: {
                        materialId: material.id,
                        warehouseId: warehouse.id,
                        type: "IN",
                        quantity: quantity,
                        reason: "Initial Stock"
                    }
                });
            }
        });

    } catch (error) {
        return {
            message: "Database Error: Failed to create material.",
        };
    }

    revalidatePath("/inventory");
    return { message: "Material created successfully" };
}

export async function updateStock(
    id: string,
    quantity: number,
    type: "IN" | "OUT" | "ADJUSTMENT" | "TRANSFER",
    reason?: string,
    warehouseId?: string,
    lotNumber?: string,
    serialNumber?: string
) {
    try {
        const warehouse = warehouseId
            ? await prisma.warehouse.findUnique({ where: { id: warehouseId } })
            : await getDefaultWarehouse();

        if (!warehouse) return { success: false, error: "Warehouse not found" };

        const material = await prisma.material.findUnique({ where: { id } });
        if (!material) return { success: false, error: "Material not found" };

        await prisma.$transaction(async (tx) => {
            // Find existing stock or create it
            // Note: We need to match lotNumber and serialNumber exactly, including nulls
            let stock = await tx.stock.findFirst({
                where: {
                    materialId: id,
                    warehouseId: warehouse.id,
                    lotNumber: lotNumber || null,
                    serialNumber: serialNumber || null
                }
            });

            if (!stock) {
                stock = await tx.stock.create({
                    data: {
                        materialId: id,
                        warehouseId: warehouse.id,
                        quantity: 0,
                        lotNumber: lotNumber || null,
                        serialNumber: serialNumber || null
                    }
                });
            }

            const newQuantity = type === "IN"
                ? stock.quantity + quantity
                : type === "OUT"
                    ? stock.quantity - quantity
                    : quantity;

            let finalQuantity = newQuantity;
            if (type === "ADJUSTMENT") {
                finalQuantity = quantity;
            }

            await tx.stock.update({
                where: { id: stock.id },
                data: { quantity: finalQuantity }
            });

            await tx.stockMovement.create({
                data: {
                    materialId: id,
                    warehouseId: warehouse.id,
                    type,
                    quantity: type === "ADJUSTMENT" ? (finalQuantity - stock.quantity) : quantity,
                    reason,
                    lotNumber: lotNumber || null,
                    serialNumber: serialNumber || null
                }
            });
        });

        revalidatePath("/inventory");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to update stock" };
    }
}

export async function deleteMaterial(id: string) {
    try {
        await prisma.material.delete({
            where: { id }
        });
        revalidatePath("/inventory");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete material" };
    }
}

export async function getStockForProducts(productIds: string[]) {
    try {
        const stocks = await prisma.stock.findMany({
            where: {
                productId: { in: productIds },
                quantity: { gt: 0 }
            },
            include: {
                warehouse: true
            }
        });
        return { success: true, data: stocks };
    } catch (error) {
        return { success: false, error: "Failed to fetch product stocks" };
    }
}
