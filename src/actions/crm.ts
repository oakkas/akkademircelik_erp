"use server";

// import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";

// --- Third Parties ---

export async function getThirdParties(type?: 'customer' | 'supplier' | 'prospect') {
    try {
        const whereClause: any = {};
        if (type === 'customer') whereClause.isCustomer = true;
        if (type === 'supplier') whereClause.isSupplier = true;
        if (type === 'prospect') whereClause.isProspect = true;

        const thirdParties = await prisma.thirdParty.findMany({
            where: whereClause,
            orderBy: { name: "asc" },
            include: { contacts: true }
        });
        return { success: true, data: thirdParties };
    } catch (error) {
        return { success: false, error: "Failed to fetch third parties" };
    }
}

export async function createThirdParty(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const taxId = formData.get("taxId") as string;

    const isCustomer = formData.get("isCustomer") === "on";
    const isSupplier = formData.get("isSupplier") === "on";
    const isProspect = formData.get("isProspect") === "on";

    if (!name) return { success: false, error: "Name is required" };

    try {
        await prisma.thirdParty.create({
            data: { name, email, phone, address, taxId, isCustomer, isSupplier, isProspect },
        });
        revalidatePath("/crm");
        revalidatePath("/sales");
        revalidatePath("/purchasing");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to create third party" };
    }
}

export async function updateThirdParty(id: string, formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const taxId = formData.get("taxId") as string;

    const isCustomer = formData.get("isCustomer") === "on";
    const isSupplier = formData.get("isSupplier") === "on";
    const isProspect = formData.get("isProspect") === "on";

    try {
        await prisma.thirdParty.update({
            where: { id },
            data: { name, email, phone, address, taxId, isCustomer, isSupplier, isProspect },
        });
        revalidatePath("/crm");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update third party" };
    }
}

// --- Contacts ---

export async function createContact(thirdPartyId: string, formData: FormData) {
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const role = formData.get("role") as string;

    if (!firstName || !lastName) return { success: false, error: "Name is required" };

    try {
        await prisma.contact.create({
            data: { thirdPartyId, firstName, lastName, email, phone, role },
        });
        revalidatePath("/crm");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to create contact" };
    }
}

export async function getContacts() {
    try {
        const contacts = await prisma.contact.findMany({
            include: { thirdParty: true },
            orderBy: { lastName: "asc" },
        });
        return { success: true, data: contacts };
    } catch (error) {
        return { success: false, error: "Failed to fetch contacts" };
    }
}
