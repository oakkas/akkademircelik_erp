"use server";

// import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";

// --- Products ---

export async function getProducts() {
    try {
        const products = await prisma.product.findMany({
            include: { stocks: true },
            orderBy: { name: "asc" },
        });
        return { success: true, data: products };
    } catch (error) {
        return { success: false, error: "Failed to fetch products" };
    }
}

export async function createProduct(formData: FormData) {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string) || 0;

    if (!name) return { success: false, error: "Name is required" };

    try {
        await prisma.product.create({
            data: { name, description, price },
        });
        revalidatePath("/production");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to create product" };
    }
}

// --- Jobs ---

export async function getJobs() {
    try {
        const jobs = await prisma.productionJob.findMany({
            include: {
                product: true,
                operations: true,
            },
            orderBy: { createdAt: "desc" },
        });
        return { success: true, data: jobs };
    } catch (error) {
        return { success: false, error: "Failed to fetch jobs" };
    }
}

export async function createJob(formData: FormData) {
    const productId = formData.get("productId") as string;
    const quantity = parseInt(formData.get("quantity") as string);
    const startDate = formData.get("startDate") ? new Date(formData.get("startDate") as string) : null;

    if (!productId || !quantity) return { success: false, error: "Product and Quantity are required" };

    try {
        // Check for custom routing
        const routing = await prisma.routing.findFirst({
            where: { productId },
            include: { steps: { orderBy: { order: "asc" } } }
        });

        let operationsToCreate = [];

        if (routing) {
            operationsToCreate = routing.steps.map(step => ({
                type: step.type,
                order: step.order,
                status: "PENDING"
            }));
        } else {
            // Default fallback
            operationsToCreate = [
                { type: "CUT", order: 1, status: "PENDING" },
                { type: "BEND", order: 2, status: "PENDING" },
                { type: "WELD", order: 3, status: "PENDING" },
            ];
        }

        // Create the job and operations
        await prisma.productionJob.create({
            data: {
                productId,
                quantity,
                startDate,
                status: "PLANNED",
                operations: {
                    create: operationsToCreate
                }
            },
        });
        revalidatePath("/production");
        return { success: true };
    } catch (error) {
        console.error("Create Job Error:", error);
        return { success: false, error: "Failed to create job" };
    }
}

export async function updateJobStatus(id: string, status: string) {
    try {
        await prisma.productionJob.update({
            where: { id },
            data: { status }
        });
        revalidatePath("/production");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update job status" };
    }
}

export async function deleteJob(id: string) {
    try {
        await prisma.productionJob.delete({
            where: { id }
        });
        revalidatePath("/production");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete job" };
    }
}

async function getStockForMaterial(materialId: string, lotNumber?: string, serialNumber?: string) {
    const where: any = { materialId, quantity: { gt: 0 } };
    if (lotNumber !== undefined) where.lotNumber = lotNumber || null;
    if (serialNumber !== undefined) where.serialNumber = serialNumber || null;

    const stock = await prisma.stock.findFirst({
        where,
        orderBy: { quantity: 'desc' }
    });
    return stock;
}

export async function consumeMaterial(jobId: string, materialId: string, quantity: number, lotNumber?: string, serialNumber?: string) {
    try {
        const stock = await getStockForMaterial(materialId, lotNumber, serialNumber);

        if (!stock || stock.quantity < quantity) {
            return { success: false, error: "Insufficient stock" };
        }

        await prisma.$transaction([
            // 1. Deduct from Stock
            prisma.stock.update({
                where: { id: stock.id },
                data: { quantity: stock.quantity - quantity }
            }),
            // 2. Log Stock Movement
            prisma.stockMovement.create({
                data: {
                    materialId,
                    warehouseId: stock.warehouseId,
                    type: "OUT",
                    quantity,
                    reason: `Used in Job ${jobId.slice(-6)}`,
                    lotNumber: stock.lotNumber,
                    serialNumber: stock.serialNumber
                }
            }),
            // 3. Record Job Consumption
            prisma.jobConsumption.create({
                data: {
                    jobId,
                    materialId,
                    quantity
                }
            })
        ]);

        revalidatePath("/production");
        revalidatePath("/inventory");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to record consumption" };
    }
}

export async function consumeBatch(jobId: string, items: { materialId: string; quantity: number }[]) {
    try {
        // Validate stock for all items first
        for (const item of items) {
            const stock = await getStockForMaterial(item.materialId);
            if (!stock) return { success: false, error: `No stock found for material: ${item.materialId}` };
            if (stock.quantity < item.quantity) return { success: false, error: `Insufficient stock for material: ${item.materialId}` };
        }

        await prisma.$transaction(async (tx) => {
            for (const item of items) {
                // Re-fetch within transaction to be safe (though simple findFirst might not lock properly in sqlite/prisma without explicit locking, but good enough for now)
                // We need to find the specific stock ID we validated against or just find one again
                const stock = await tx.stock.findFirst({
                    where: { materialId: item.materialId, quantity: { gte: item.quantity } }
                });

                if (!stock) throw new Error(`Stock changed or unavailable for ${item.materialId}`);

                // 1. Deduct
                await tx.stock.update({
                    where: { id: stock.id },
                    data: { quantity: stock.quantity - item.quantity }
                });

                // 2. Log Movement
                await tx.stockMovement.create({
                    data: {
                        materialId: item.materialId,
                        warehouseId: stock.warehouseId,
                        type: "OUT",
                        quantity: item.quantity,
                        reason: `Batch Used in Job ${jobId.slice(-6)}`
                    }
                });

                // 3. Record Consumption
                await tx.jobConsumption.create({
                    data: {
                        jobId,
                        materialId: item.materialId,
                        quantity: item.quantity
                    }
                });
            }
        });

        revalidatePath("/production");
        revalidatePath("/inventory");
        return { success: true };
    } catch (error) {
        console.error("Consume Batch Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to record batch consumption" };
    }
}

// --- Bill of Materials (BOM) ---

export async function getBOMs() {
    try {
        const boms = await prisma.billOfMaterial.findMany({
            include: {
                product: true,
                items: {
                    include: {
                        material: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });
        return { success: true, data: boms };
    } catch (error) {
        return { success: false, error: "Failed to fetch BOMs" };
    }
}

export async function getBOMForProduct(productId: string) {
    try {
        const bom = await prisma.billOfMaterial.findFirst({
            where: { productId },
            include: {
                items: true
            }
        });
        return { success: true, data: bom };
    } catch (error) {
        return { success: false, error: "Failed to fetch BOM for product" };
    }
}

export async function createBOM(productId: string, name: string, items: { materialId: string; quantity: number }[]) {
    try {
        await prisma.billOfMaterial.create({
            data: {
                productId,
                name,
                items: {
                    create: items.map(item => ({
                        materialId: item.materialId,
                        quantity: item.quantity
                    }))
                }
            }
        });
        revalidatePath("/production/boms");
        return { success: true };
    } catch (error) {
        console.error("Create BOM Error:", error);
        return { success: false, error: "Failed to create BOM" };
    }
}

// --- Routings ---

export async function getRoutings() {
    try {
        const routings = await prisma.routing.findMany({
            include: {
                product: true,
                steps: {
                    orderBy: { order: "asc" }
                }
            },
            orderBy: { createdAt: "desc" }
        });
        return { success: true, data: routings };
    } catch (error) {
        return { success: false, error: "Failed to fetch routings" };
    }
}

export async function createRouting(productId: string, name: string, steps: { order: number; type: string; description: string }[]) {
    try {
        await prisma.routing.create({
            data: {
                productId,
                name,
                steps: {
                    create: steps.map(step => ({
                        order: step.order,
                        type: step.type,
                        description: step.description
                    }))
                }
            }
        });
        revalidatePath("/production/routings");
        return { success: true };
    } catch (error) {
        console.error("Create Routing Error:", error);
        return { success: false, error: "Failed to create routing" };
    }
}
