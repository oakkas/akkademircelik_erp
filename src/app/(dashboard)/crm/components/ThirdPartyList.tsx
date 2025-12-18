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
import { ThirdParty } from "@prisma/client";
import { useLanguage } from "@/context/LanguageContext";

interface ThirdPartyListProps {
    thirdParties: ThirdParty[];
}

export function ThirdPartyList({ thirdParties }: ThirdPartyListProps) {
    const { t } = useLanguage();

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t("inventory.name")}</TableHead>
                        <TableHead>{t("sales.email")}</TableHead>
                        <TableHead>{t("sales.phone")}</TableHead>
                        <TableHead>{t("inventory.type")}</TableHead>
                        <TableHead>{t("crm.taxId")}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {thirdParties.map((tp) => (
                        <TableRow key={tp.id}>
                            <TableCell className="font-medium">{tp.name}</TableCell>
                            <TableCell>{tp.email}</TableCell>
                            <TableCell>{tp.phone}</TableCell>
                            <TableCell>
                                <div className="flex gap-1">
                                    {tp.isCustomer && <Badge>{t("crm.isCustomer")}</Badge>}
                                    {tp.isSupplier && <Badge variant="secondary">{t("crm.isSupplier")}</Badge>}
                                    {tp.isProspect && <Badge variant="outline">{t("crm.isProspect")}</Badge>}
                                </div>
                            </TableCell>
                            <TableCell>{tp.taxId}</TableCell>
                        </TableRow>
                    ))}
                    {thirdParties.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                {t("common.noData")}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
