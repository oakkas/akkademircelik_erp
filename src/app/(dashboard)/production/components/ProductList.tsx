"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Product } from "@prisma/client";
import { useLanguage } from "@/context/LanguageContext";

interface ProductListProps {
    products: Product[];
}

export function ProductList({ products }: ProductListProps) {
    const { t } = useLanguage();

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t("inventory.name")}</TableHead>
                        <TableHead>{t("common.price")}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => (
                        <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>${product.price ? product.price.toFixed(2) : "0.00"}</TableCell>
                        </TableRow>
                    ))}
                    {products.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={2} className="h-24 text-center">
                                {t("common.noData")}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
