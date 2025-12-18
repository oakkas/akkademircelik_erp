"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Warehouse } from "@prisma/client";

interface WarehouseListProps {
    warehouses: Warehouse[];
}

import { useLanguage } from "@/context/LanguageContext";

export function WarehouseList({ warehouses }: WarehouseListProps) {
    const { t } = useLanguage();

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t("inventory.name")}</TableHead>
                        <TableHead>{t("inventory.address")}</TableHead>
                        <TableHead>{t("inventory.createdAt")}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {warehouses.map((warehouse) => (
                        <TableRow key={warehouse.id}>
                            <TableCell className="font-medium">{warehouse.name}</TableCell>
                            <TableCell>{warehouse.address || "-"}</TableCell>
                            <TableCell>{new Date(warehouse.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                    ))}
                    {warehouses.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                                {t("common.noData")}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
