"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, FileText, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

interface FinancePageContentProps {
    totalRevenue: number;
    pendingInvoices: number;
    overdueAmount: number;
}

export function FinancePageContent({ totalRevenue, pendingInvoices, overdueAmount }: FinancePageContentProps) {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Link href="/finance/invoices">
                    <Button>{t("finance.viewInvoices") || "View All Invoices"}</Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("dashboard.totalRevenue")}</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            {t("finance.collectedFromSales") || "Collected from paid sales invoices"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("dashboard.pendingOrders")}</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingInvoices}</div>
                        <p className="text-xs text-muted-foreground">
                            {t("finance.waitingForPayment") || "Invoices waiting for payment"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("finance.overdueAmount") || "Overdue Amount"}</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">${overdueAmount.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            {t("finance.totalUnpaid") || "Total unpaid past due date"}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
