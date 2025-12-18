"use client";

import { useState } from "react";
import { registerPayment } from "@/actions/finance";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { DollarSign } from "lucide-react";
import { Invoice } from "@prisma/client";
import { useLanguage } from "@/context/LanguageContext";

interface RegisterPaymentDialogProps {
    invoice: Invoice;
}

export function RegisterPaymentDialog({ invoice }: RegisterPaymentDialogProps) {
    const [open, setOpen] = useState(false);
    const { t } = useLanguage();
    const [amount, setAmount] = useState<number>(invoice.totalAmount - invoice.paidAmount);
    const [method, setMethod] = useState<string>("BANK_TRANSFER");

    async function onSubmit(formData: FormData) {
        const result = await registerPayment(invoice.id, amount, method);
        if (result.success) {
            setOpen(false);
        } else {
            alert(result.error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={invoice.status === "PAID" || invoice.status === "CANCELLED"}>
                    <DollarSign className="mr-2 h-4 w-4" /> {t("finance.pay")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("finance.recordPayment")}</DialogTitle>
                    <DialogDescription>
                        {t("finance.registerPaymentDescription")} #{invoice.id.slice(-6)}.
                        {t("finance.remainingBalance")}: ${(invoice.totalAmount - invoice.paidAmount).toFixed(2)}
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">{t("finance.amount")}</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            max={invoice.totalAmount - invoice.paidAmount}
                            value={amount}
                            onChange={(e) => setAmount(parseFloat(e.target.value))}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="method" className="text-right">{t("finance.paymentMethod")}</Label>
                        <Select onValueChange={setMethod} value={method}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder={t("finance.selectPaymentMethod")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CASH">{t("finance.cash")}</SelectItem>
                                <SelectItem value="BANK_TRANSFER">{t("finance.bankTransfer")}</SelectItem>
                                <SelectItem value="CHECK">{t("finance.check")}</SelectItem>
                                <SelectItem value="CREDIT_CARD">{t("finance.creditCard")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="submit">{t("finance.recordPayment")}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
