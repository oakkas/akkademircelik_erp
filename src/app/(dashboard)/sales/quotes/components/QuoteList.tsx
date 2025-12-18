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
import { Quote, ThirdParty, QuoteItem } from "@prisma/client";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { generateQuotePDF } from "@/lib/pdf-generator";

interface QuoteWithRelations extends Quote {
    thirdParty: ThirdParty;
    items: (QuoteItem & { product: { name: string } | null })[];
}

interface QuoteListProps {
    quotes: QuoteWithRelations[];
}

export function QuoteList({ quotes }: QuoteListProps) {
    const { t } = useLanguage();

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t("sales.quoteId")}</TableHead>
                        <TableHead>{t("sales.customer")}</TableHead>
                        <TableHead>{t("common.items")}</TableHead>
                        <TableHead>{t("sales.totalAmount")}</TableHead>
                        <TableHead>{t("common.status")}</TableHead>
                        <TableHead>{t("sales.validUntil")}</TableHead>
                        <TableHead>{t("common.createdAt")}</TableHead>
                        <TableHead>{t("common.actions")}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {quotes.map((quote) => (
                        <TableRow key={quote.id}>
                            <TableCell className="font-medium">{quote.id.slice(-6)}</TableCell>
                            <TableCell>{quote.thirdParty.name}</TableCell>
                            <TableCell>{quote.items.length} {t("common.items")}</TableCell>
                            <TableCell>${quote.totalAmount.toFixed(2)}</TableCell>
                            <TableCell>
                                <Badge variant={quote.status === "VALIDATED" ? "default" : "secondary"}>
                                    {t(`status.${quote.status}`)}
                                </Badge>
                            </TableCell>
                            <TableCell>{quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : "-"}</TableCell>
                            <TableCell>{new Date(quote.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => generateQuotePDF(quote)}
                                    title={t("common.download")}
                                >
                                    <FileText className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {quotes.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                                {t("sales.noQuotes")}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
