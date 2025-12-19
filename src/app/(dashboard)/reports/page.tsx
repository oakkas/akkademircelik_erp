import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, PieChart, TrendingUp, Package, Users, DollarSign } from "lucide-react"
import Link from "next/link"

export default function ReportsPage() {
    const reportCategories = [
        {
            title: "Satış Raporları",
            description: "En çok satış yapılan müşteriler, ürünler ve satış trendleri.",
            icon: TrendingUp,
            href: "/reports/sales",
            color: "text-blue-500",
            stats: [
                { label: "Top Customers", icon: Users },
                { label: "Top Products", icon: Package },
                { label: "Sales Trends", icon: BarChart3 },
            ]
        },
        {
            title: "Finans Raporları",
            description: "Gelir-Gider tablosu, nakit akışı ve yaşlandırma raporları.",
            icon: DollarSign,
            href: "/reports/finance",
            color: "text-green-500",
            stats: [
                { label: "Profit & Loss", icon: TrendingUp },
                { label: "Cash Flow", icon: PieChart },
                { label: "Aging Report", icon: BarChart3 },
            ]
        },
        {
            title: "Stok Raporları",
            description: "Stok değerlemesi, kritik stok seviyeleri ve hareket geçmişi.",
            icon: Package,
            href: "/reports/inventory",
            color: "text-orange-500",
            stats: [
                { label: "Valuation", icon: DollarSign },
                { label: "Low Stock", icon: TrendingUp },
                { label: "Movements", icon: BarChart3 },
            ]
        }
    ]

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Raporlar</h1>
            <p className="text-muted-foreground">
                İşletmenizle ilgili detaylı analizler ve raporlar.
            </p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {reportCategories.map((category) => (
                    <Link key={category.title} href={category.href}>
                        <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <category.icon className={`h-6 w-6 ${category.color}`} />
                                    <CardTitle>{category.title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {category.description}
                                </p>
                                <div className="grid grid-cols-3 gap-2">
                                    {category.stats.map((stat) => (
                                        <div key={stat.label} className="flex flex-col items-center justify-center p-2 bg-background rounded-md border text-center">
                                            <stat.icon className="h-4 w-4 mb-1 text-muted-foreground" />
                                            <span className="text-[10px] text-muted-foreground font-medium">{stat.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
