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

interface CustomerListProps {
    customers: ThirdParty[];
}

export function CustomerList({ customers }: CustomerListProps) {
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
                    {customers.map((customer) => (
                        <TableRow key={customer.id}>
                            <TableCell className="font-medium">{customer.name}</TableCell>
                            <TableCell>{customer.email}</TableCell>
                            <TableCell>{customer.phone}</TableCell>
                            <TableCell>{customer.address}</TableCell>
                        </TableRow>
                    ))}
                    {customers.length === 0 && (
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
