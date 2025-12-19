'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStockValuation, getLowStockItems, getStockMovements } from "@/actions/reports"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function InventoryReportsPage() {
    const [valuation, setValuation] = useState<{ total: number, byProduct: { name: string, value: number }[] } | null>(null)
    const [lowStock, setLowStock] = useState<{ name: string, quantity: number, price: number | null }[]>([])
    const [movements, setMovements] = useState<{ id: string, date: Date, product: string, type: string, quantity: number }[]>([])
    const [loading, setLoading] = useState(true)

    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchData() {
            try {
                const [val, low, mov] = await Promise.all([
                    getStockValuation(),
                    getLowStockItems(),
                    getStockMovements()
                ])
                setValuation(val)
                setLowStock(low)
                setMovements(mov)
            } catch (err) {
                console.error("Failed to fetch inventory reports:", err)
                setError("Raporlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return <div className="p-6">Yükleniyor...</div>
    }

    if (error) {
        return <div className="p-6 text-red-500">{error}</div>
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Stok Raporları</h1>

            {/* Total Valuation Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Toplam Stok Değeri</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(valuation?.total || 0)}</div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Valuation by Product Chart */}
                <Card className="col-span-2 lg:col-span-1">
                    <CardHeader>
                        <CardTitle>En Değerli Ürünler (Top 10)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={valuation?.byProduct} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" tickFormatter={(value) => `₺${value / 1000}k`} />
                                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="value" name="Stok Değeri" fill="#8884d8" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Low Stock Table */}
                <Card className="col-span-2 lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Kritik Stok Seviyeleri (&lt; 10)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ürün</TableHead>
                                    <TableHead className="text-right">Miktar</TableHead>
                                    <TableHead className="text-right">Fiyat</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lowStock.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground">Kritik stok yok.</TableCell>
                                    </TableRow>
                                ) : (
                                    lowStock.map((item) => (
                                        <TableRow key={item.name}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="destructive">{item.quantity}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.price || 0)}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Recent Movements Table */}
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Son Stok Hareketleri</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tarih</TableHead>
                                    <TableHead>Ürün</TableHead>
                                    <TableHead>İşlem</TableHead>
                                    <TableHead className="text-right">Miktar</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {movements.map((m) => (
                                    <TableRow key={m.id}>
                                        <TableCell>{new Date(m.date).toLocaleDateString('tr-TR')}</TableCell>
                                        <TableCell>{m.product}</TableCell>
                                        <TableCell>
                                            <Badge variant={m.type === 'IN' ? 'default' : 'secondary'}>
                                                {m.type === 'IN' ? 'Giriş' : 'Çıkış'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {m.type === 'IN' ? '+' : '-'}{Math.abs(m.quantity)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
