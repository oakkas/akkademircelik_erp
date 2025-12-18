"use client";

import { useState } from "react";
import { createInvoice } from "@/actions/finance";
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
import { Plus, Trash2 } from "lucide-react";
import { ThirdParty } from "@prisma/client";
import { useLanguage } from "@/context/LanguageContext";

interface CreateInvoiceDialogProps {
    thirdParties: ThirdParty[];
}

export function CreateInvoiceDialog({ thirdParties }: CreateInvoiceDialogProps) {
    const [open, setOpen] = useState(false);
    const [type, setType] = useState<"SALES" | "PURCHASE">("SALES");
    const [thirdPartyId, setThirdPartyId] = useState("");
    const [items, setItems] = useState<{ description: string; quantity: number; unitPrice: number }[]>([
        { description: "", quantity: 1, unitPrice: 0 }
    ]);
    const { t } = useLanguage();

    const handleAddItem = () => {
        setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: "description" | "quantity" | "unitPrice", value: string | number) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index][field] = value;
        setItems(newItems);
    };

    const filteredThirdParties = thirdParties.filter(tp =>
        type === "SALES" ? tp.isCustomer : tp.isSupplier
    );

    async function onSubmit(formData: FormData) {
        formData.append("items", JSON.stringify(items));
        const result = await createInvoice(formData);
        if (result.success) {
            setOpen(false);
            setItems([{ description: "", quantity: 1, unitPrice: 0 }]);
            setThirdPartyId("");
        } else {
            alert(result.error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> {t("finance.newInvoice")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>{t("finance.newInvoice")}</DialogTitle>
                    <DialogDescription>
                        {t("finance.newInvoiceDescription")}
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">{t("inventory.type")}</Label>
                        <Select onValueChange={(val: "SALES" | "PURCHASE") => setType(val)} value={type}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder={t("finance.selectType")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SALES">{t("finance.salesInvoice")}</SelectItem>
                                <SelectItem value="PURCHASE">{t("finance.purchaseInvoice")}</SelectItem>
                            </SelectContent>
                        </Select>
                        <input type="hidden" name="type" value={type} />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="thirdParty" className="text-right">
                            {type === "SALES" ? t("sales.customer") : t("purchasing.supplier")}
                        </Label>
                        <Select onValueChange={setThirdPartyId} value={thirdPartyId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder={t("finance.selectThirdParty")} />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredThirdParties.map(tp => (
                                    <SelectItem key={tp.id} value={tp.id}>{tp.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <input type="hidden" name="thirdPartyId" value={thirdPartyId} />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="issueDate" className="text-right">{t("finance.issueDate")}</Label>
                        <Input id="issueDate" name="issueDate" type="date" className="col-span-3" required defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dueDate" className="text-right">{t("finance.dueDate")}</Label>
                        <Input id="dueDate" name="dueDate" type="date" className="col-span-3" />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label>{t("common.items")}</Label>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                                <Plus className="h-4 w-4 mr-2" /> {t("sales.addItem")}
                            </Button>
                        </div>
                        {items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-end">
                                <div className="col-span-5">
                                    <Label className="text-xs">{t("common.description")}</Label>
                                    <Input
                                        value={item.description}
                                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
                                        placeholder={t("common.description")}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-xs">{t("inventory.quantity")}</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <Label className="text-xs">{t("common.price")}</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        value={item.unitPrice}
                                        onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value))}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => handleRemoveItem(index)}
                                        disabled={items.length === 1}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button type="submit">{t("finance.createInvoice")}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
