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
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Product, Stock } from "@prisma/client";
import { useLanguage } from "@/context/LanguageContext";

interface ProductWithStocks extends Product {
    stocks: Stock[];
}

interface ProductListTableProps {
    products: ProductWithStocks[];
}

export function ProductListTable({ products }: ProductListTableProps) {
    const { t } = useLanguage();

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t("inventory.name")}</TableHead>
                        <TableHead>{t("inventory.description")}</TableHead>
                        <TableHead>{t("inventory.price")}</TableHead>
                        <TableHead>{t("inventory.quantity")}</TableHead>
                        <TableHead className="text-right">{t("inventory.actions")}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                {t("common.noData")}
                            </TableCell>
                        </TableRow>
                    ) : (
                        products.map((product) => {
                            const totalQuantity = product.stocks.reduce((sum, stock) => sum + stock.quantity, 0);
                            return (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{product.description || "-"}</TableCell>
                                    <TableCell>${product.price?.toFixed(2) || "0.00"}</TableCell>
                                    <TableCell>{totalQuantity}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                disabled
                                                title={t("common.delete")}
                                            >
                                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
