'use server'

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { auth } from "@/auth"

export async function getUsers() {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
        throw new Error("Unauthorized")
    }

    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
        }
    })
}

export async function createUser(data: any) {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
        throw new Error("Unauthorized")
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    try {
        await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: data.role || 'USER'
            }
        })
        revalidatePath('/settings/users')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to create user. Email might be taken." }
    }
}

export async function updateUser(id: string, data: any) {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
        throw new Error("Unauthorized")
    }

    try {
        await prisma.user.update({
            where: { id },
            data: {
                name: data.name,
                email: data.email,
                role: data.role
            }
        })
        revalidatePath('/settings/users')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update user." }
    }
}

export async function deleteUser(id: string) {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
        throw new Error("Unauthorized")
    }

    try {
        await prisma.user.delete({
            where: { id }
        })
        revalidatePath('/settings/users')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete user." }
    }
}
