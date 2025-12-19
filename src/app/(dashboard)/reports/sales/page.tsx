'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getTopCustomers, getTopProducts, getSalesTrends } from "@/actions/reports"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { formatCurrency } from "@/lib/utils"

export default function SalesReportsPage() {
    const [topCustomers, setTopCustomers] = useState<{ name: string, total: number }[]>([])
    const [topProducts, setTopProducts] = useState<{ name: string, quantity: number }[]>([])
    const [salesTrends, setSalesTrends] = useState<{ name: string, total: number }[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            const [customers, products, trends] = await Promise.all([
                getTopCustomers(),
                getTopProducts(),
                getSalesTrends()
            ])
            setTopCustomers(customers)
            setTopProducts(products)
            setSalesTrends(trends)
            setLoading(false)
        }
        fetchData()
    }, [])

    if (loading) {
        return <div className="p-6">Yükleniyor...</div>
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Satış Raporları</h1>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Top Customers Chart */}
                <Card className="col-span-2 lg:col-span-1">
                    <CardHeader>
                        <CardTitle>En Çok Satış Yapılan Müşteriler (Top 10)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topCustomers} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" tickFormatter={(value) => `₺${value / 1000}k`} />
                                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="total" name="Toplam Satış" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Products Chart */}
                <Card className="col-span-2 lg:col-span-1">
                    <CardHeader>
                        <CardTitle>En Çok Satılan Ürünler (Miktar)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="quantity" name="Adet" fill="#f97316" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Sales Trends Chart */}
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Son 6 Ay Satış Trendi</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => `₺${value / 1000}k`} />
                                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                                <Legend />
                                <Line type="monotone" dataKey="total" name="Aylık Satış" stroke="#10b981" strokeWidth={2} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
