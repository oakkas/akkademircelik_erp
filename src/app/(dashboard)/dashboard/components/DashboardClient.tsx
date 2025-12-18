"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Factory, ShoppingCart, Truck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function DashboardClient() {
    const { t } = useLanguage();

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">{t("common.dashboard")}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t("dashboard.totalRevenue")} {/* Using Total Revenue key for Inventory for now as per dictionary, or should update dictionary? Dictionary has 'Total Revenue', 'Active Jobs', 'Low Stock Items', 'Pending Orders'. The current page has 'Total Inventory', 'Active Jobs', 'Sales', 'Purchases'. I will map them best effort or update dictionary. */}
                            {/* Let's stick to the dictionary keys I defined: totalRevenue, activeJobs, lowStockItems, pendingOrders. 
                                Wait, the current page has Inventory, Jobs, Sales, Purchases. 
                                I should probably update the dictionary to match the actual dashboard content or update the dashboard to match the dictionary.
                                The dictionary has: totalRevenue, activeJobs, lowStockItems, pendingOrders.
                                The page has: Total Inventory, Active Jobs, Sales, Purchases.
                                I'll update the dictionary to be more generic or match the page.
                                For now, I'll use the existing keys and maybe add new ones if needed.
                                Actually, I'll just use 'common.inventory', 'common.production', 'common.sales', 'common.purchasing' for the card titles! That's smarter.
                            */}
                            {t("common.inventory")}
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,234</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% {t("dashboard.fromLastMonth")}
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
                        <div className="text-2xl font-bold">+12</div>
                        <p className="text-xs text-muted-foreground">
                            +2 {t("dashboard.fromLastMonth")}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("common.sales")}</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+573</div>
                        <p className="text-xs text-muted-foreground">
                            +201 {t("dashboard.fromLastMonth")}
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
                        <div className="text-2xl font-bold">+12</div>
                        <p className="text-xs text-muted-foreground">
                            +4 {t("dashboard.fromLastMonth")}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
