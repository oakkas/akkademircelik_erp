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
import { Invoice, ThirdParty } from "@prisma/client";
import { useLanguage } from "@/context/LanguageContext";
import { RegisterPaymentDialog } from "./RegisterPaymentDialog";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { generateInvoicePDF } from "@/lib/pdf-generator";

interface InvoiceWithRelations extends Invoice {
    thirdParty: ThirdParty;
    items: any[]; // Using any[] to avoid circular dependency or import issues for now, ideally InvoiceItem[]
}

interface InvoiceListProps {
    invoices: InvoiceWithRelations[];
}

export function InvoiceList({ invoices }: InvoiceListProps) {
    const { t } = useLanguage();

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t("finance.invoiceId")}</TableHead>
                        <TableHead>{t("inventory.type")}</TableHead>
                        <TableHead>{t("crm.thirdParties")}</TableHead>
                        <TableHead>{t("common.date")}</TableHead>
                        <TableHead>{t("finance.dueDate")}</TableHead>
                        <TableHead>{t("finance.amount")}</TableHead>
                        <TableHead>{t("finance.paid")}</TableHead>
                        <TableHead>{t("common.status")}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                            <TableCell className="font-medium">{invoice.id.slice(-6)}</TableCell>
                            <TableCell>
                                <Badge variant="outline">{invoice.type}</Badge>
                            </TableCell>
                            <TableCell>{invoice.thirdParty.name}</TableCell>
                            <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                            <TableCell>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "-"}</TableCell>
                            <TableCell>${invoice.totalAmount.toFixed(2)}</TableCell>
                            <TableCell>${invoice.paidAmount.toFixed(2)}</TableCell>
                            <TableCell>
                                <div className="flex space-x-2">
                                    <Badge variant={
                                        invoice.status === "PAID" ? "default" :
                                            invoice.status === "PARTIALLY_PAID" ? "secondary" :
                                                invoice.status === "CANCELLED" ? "destructive" : "outline"
                                    }>
                                        {invoice.status}
                                    </Badge>
                                    <RegisterPaymentDialog invoice={invoice} />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => generateInvoicePDF(invoice)}
                                        title={t("common.download")}
                                    >
                                        <FileText className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {invoices.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                                {t("finance.noInvoices")}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
