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
import { formatCurrency } from "@/lib/utils";

interface OrderWithRelations extends Order {
    thirdParty: ThirdParty;
    items: OrderItem[];
}

interface PurchaseOrderListProps {
    orders: OrderWithRelations[];
}

export function PurchaseOrderList({ orders }: PurchaseOrderListProps) {
    const { t } = useLanguage();

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t("purchasing.orderId")}</TableHead>
                        <TableHead>{t("purchasing.supplier")}</TableHead>
                        <TableHead>{t("common.items")}</TableHead>
                        <TableHead>{t("common.totalAmount")}</TableHead>
                        <TableHead>{t("common.status")}</TableHead>
                        <TableHead>{t("common.date")}</TableHead>
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
                        </TableRow>
                    ))}
                    {orders.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                {t("purchasing.noOrders")}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
