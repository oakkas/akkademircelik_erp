'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getFinancialSummary, getCashFlow, getAgingReport } from "@/actions/reports"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { formatCurrency } from "@/lib/utils"

export default function FinancialReportsPage() {
    const [summary, setSummary] = useState<{ revenue: number, expenses: number, profit: number } | null>(null)
    const [cashFlow, setCashFlow] = useState<{ name: string, income: number, expense: number }[]>([])
    const [aging, setAging] = useState<{ name: string, amount: number }[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            const [sum, flow, age] = await Promise.all([
                getFinancialSummary(),
                getCashFlow(),
                getAgingReport()
            ])
            setSummary(sum)
            setCashFlow(flow)
            setAging(age)
            setLoading(false)
        }
        fetchData()
    }, [])

    if (loading) {
        return <div className="p-6">Yükleniyor...</div>
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Finans Raporları</h1>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Gelir (Tahmini)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(summary?.revenue || 0)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Gider (Tahmini)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(summary?.expenses || 0)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Kâr (Tahmini)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${summary?.profit && summary.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {formatCurrency(summary?.profit || 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Cash Flow Chart */}
                <Card className="col-span-2 lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Nakit Akışı (Son 6 Ay)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={cashFlow} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => `₺${value / 1000}k`} />
                                <Tooltip formatter={(value: number | undefined) => formatCurrency(value || 0)} />
                                <Legend />
                                <Bar dataKey="income" name="Gelir" fill="#10b981" />
                                <Bar dataKey="expense" name="Gider" fill="#ef4444" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Aging Report Chart */}
                <Card className="col-span-2 lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Fatura Yaşlandırma Raporu (Gecikmiş)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={aging}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }: { name: string, percent?: number }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="amount"
                                >
                                    {aging.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number | undefined) => formatCurrency(value || 0)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
