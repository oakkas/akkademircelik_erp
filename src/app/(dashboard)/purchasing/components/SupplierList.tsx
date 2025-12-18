"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ThirdParty } from "@prisma/client";
import { useLanguage } from "@/context/LanguageContext";

interface SupplierListProps {
    suppliers: ThirdParty[];
}

export function SupplierList({ suppliers }: SupplierListProps) {
    const { t } = useLanguage();

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t("inventory.name")}</TableHead>
                        <TableHead>{t("sales.email")}</TableHead>
                        <TableHead>{t("sales.phone")}</TableHead>
                        <TableHead>{t("sales.address")}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {suppliers.map((supplier) => (
                        <TableRow key={supplier.id}>
                            <TableCell className="font-medium">{supplier.name}</TableCell>
                            <TableCell>{supplier.email}</TableCell>
                            <TableCell>{supplier.phone}</TableCell>
                            <TableCell>{supplier.address}</TableCell>
                        </TableRow>
                    ))}
                    {suppliers.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                {t("common.noData")}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
