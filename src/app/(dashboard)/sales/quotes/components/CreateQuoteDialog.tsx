"use client";

import { useState } from "react";
import { createQuote } from "@/actions/sales";
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
import { ThirdParty, Product } from "@prisma/client";
import { useLanguage } from "@/context/LanguageContext";

interface CreateQuoteDialogProps {
    customers: ThirdParty[];
    products: Product[];
}

export function CreateQuoteDialog({ customers, products }: CreateQuoteDialogProps) {
    const [open, setOpen] = useState(false);
    const [customerId, setCustomerId] = useState("");
    const [items, setItems] = useState<{ productId: string; quantity: number; unitPrice: number }[]>([{ productId: "", quantity: 1, unitPrice: 0 }]);
    const { t } = useLanguage();

    const handleAddItem = () => {
        setItems([...items, { productId: "", quantity: 1, unitPrice: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: "productId" | "quantity", value: string | number) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index][field] = value;

        if (field === "productId") {
            const product = products.find(p => p.id === value);
            if (product && product.price) {
                newItems[index].unitPrice = product.price;
            }
        }

        setItems(newItems);
    };

    const handleSave = async () => {
        if (!customerId || items.some(i => !i.productId)) return;
        await createQuote(customerId, items);
        setOpen(false);
        setCustomerId("");
        setItems([{ productId: "", quantity: 1, unitPrice: 0 }]);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> {t("sales.newQuote")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{t("sales.newQuote")}</DialogTitle>
                    <DialogDescription>
                        {t("sales.newQuoteDescription")}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="customer" className="text-right">
                            {t("sales.customer")}
                        </Label>
                        <Select onValueChange={setCustomerId} value={customerId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder={t("sales.customer")} />
                            </SelectTrigger>
                            <SelectContent>
                                {customers.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                                <div className="col-span-7">
                                    <Label className="text-xs">{t("production.product")}</Label>
                                    <Select
                                        value={item.productId}
                                        onValueChange={(val) => handleItemChange(index, "productId", val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("production.product")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map(p => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {p.name} (${p.price ? p.price.toFixed(2) : "0.00"})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-3">
                                    <Label className="text-xs">{t("inventory.quantity")}</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value))}
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
                </div>
                <DialogFooter>
                    <Button onClick={handleSave}>{t("sales.createQuote")}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
