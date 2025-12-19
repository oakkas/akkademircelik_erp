'use client'

import { useState, useEffect } from "react"
import { getUsers, createUser, deleteUser } from "@/actions/users"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { useLanguage } from "@/context/LanguageContext"

export default function UsersPage() {
    const { t } = useLanguage()
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'USER' })

    useEffect(() => {
        loadUsers()
    }, [])

    async function loadUsers() {
        try {
            const data = await getUsers()
            setUsers(data)
        } catch (error) {
            console.error(error)
            toast.error(t("settings.loadError"))
        } finally {
            setLoading(false)
        }
    }

    async function handleCreateUser() {
        if (!newUser.name || !newUser.email || !newUser.password) {
            toast.error(t("settings.fillAllFields"))
            return
        }

        const result = await createUser(newUser)
        if (result.success) {
            toast.success(t("settings.userCreated"))
            setIsAddOpen(false)
            setNewUser({ name: '', email: '', password: '', role: 'USER' })
            loadUsers()
        } else {
            toast.error(result.error || t("settings.createError"))
        }
    }

    async function handleDeleteUser(id: string) {
        if (!confirm(t("settings.deleteConfirm"))) return

        const result = await deleteUser(id)
        if (result.success) {
            toast.success(t("settings.userDeleted"))
            loadUsers()
        } else {
            toast.error(result.error || t("settings.deleteError"))
        }
    }

    if (loading) return <div className="p-6">{t("common.loading")}</div>

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">{t("settings.userManagement")}</h1>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button><UserPlus className="mr-2 h-4 w-4" /> {t("settings.addUser")}</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t("settings.addUser")}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>{t("settings.name")}</Label>
                                <Input
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t("settings.email")}</Label>
                                <Input
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    placeholder="john@example.com"
                                    type="email"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t("settings.password")}</Label>
                                <Input
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    type="password"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t("settings.role")}</Label>
                                <Select
                                    value={newUser.role}
                                    onValueChange={(val) => setNewUser({ ...newUser, role: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USER">User</SelectItem>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddOpen(false)}>{t("settings.cancel")}</Button>
                            <Button onClick={handleCreateUser}>{t("settings.createUser")}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("settings.name")}</TableHead>
                            <TableHead>{t("settings.email")}</TableHead>
                            <TableHead>{t("settings.role")}</TableHead>
                            <TableHead>{t("settings.createdAt")}</TableHead>
                            <TableHead className="text-right">{t("settings.actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {user.role}
                                    </span>
                                </TableCell>
                                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
