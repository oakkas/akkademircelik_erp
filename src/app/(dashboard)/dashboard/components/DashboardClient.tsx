"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Factory, ShoppingCart, Truck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface DashboardStats {
    inventory: {
        totalItems: number;
        trend: number;
    };
    activeJobs: {
        count: number;
        trend: number;
    };
    sales: {
        total: number;
        trend: number;
    };
    purchasing: {
        count: number;
        trend: number;
    };
}

export function DashboardClient({ stats }: { stats: DashboardStats }) {
    const { t } = useLanguage();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
    };

    const formatTrend = (value: number) => {
        return value > 0 ? `+${value}` : `${value}`;
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">{t("common.dashboard")}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t("common.inventory")}
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.inventory.totalItems}</div>
                        <p className="text-xs text-muted-foreground">
                            {/* Trend logic is simplified for now */}
                            {t("common.items")}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t("dashboard.activeJobs")}
                        </CardTitle>
                        <Factory className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeJobs.count}</div>
                        <p className="text-xs text-muted-foreground">
                            {formatTrend(stats.activeJobs.trend)} {t("dashboard.fromLastMonth")}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("common.sales")}</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.sales.total)}</div>
                        <p className="text-xs text-muted-foreground">
                            {formatCurrency(stats.sales.trend)} {t("dashboard.fromLastMonth")}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t("common.purchasing")}
                        </CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.purchasing.count}</div>
                        <p className="text-xs text-muted-foreground">
                            {formatTrend(stats.purchasing.trend)} {t("dashboard.fromLastMonth")}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
