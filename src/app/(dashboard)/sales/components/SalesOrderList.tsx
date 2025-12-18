"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Order, ThirdParty, OrderItem } from "@prisma/client";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { generateOrderPDF } from "@/lib/pdf-generator";
import { formatCurrency } from "@/lib/utils";

interface OrderWithRelations extends Order {
    thirdParty: ThirdParty;
    items: (OrderItem & { product: { name: string } | null })[];
}

interface SalesOrderListProps {
    orders: OrderWithRelations[];
}

export function SalesOrderList({ orders }: SalesOrderListProps) {
    const { t } = useLanguage();

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t("sales.orderId")}</TableHead>
                        <TableHead>{t("sales.customer")}</TableHead>
                        <TableHead>{t("common.items")}</TableHead>
                        <TableHead>{t("sales.totalAmount")}</TableHead>
                        <TableHead>{t("common.status")}</TableHead>
                        <TableHead>{t("common.createdAt")}</TableHead>
                        <TableHead>{t("common.actions")}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.id.slice(-6)}</TableCell>
                            <TableCell>{order.thirdParty?.name || "Unknown"}</TableCell>
                            <TableCell>{order.items.length} {t("common.items")}</TableCell>
                            <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                            <TableCell>
                                <Badge variant={order.status === "COMPLETED" ? "default" : "secondary"}>
                                    {t(`status.${order.status}`)}
                                </Badge>
                            </TableCell>
                            <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => generateOrderPDF(order)}
                                    title={t("common.download")}
                                >
                                    <FileText className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {orders.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                                {t("sales.noOrders")}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
