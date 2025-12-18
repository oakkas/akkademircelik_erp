"use client";

import { useState } from "react";
import { createPurchaseOrder } from "@/actions/purchasing";
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
import { ThirdParty, Material } from "@prisma/client";
import { useLanguage } from "@/context/LanguageContext";

interface CreatePurchaseOrderDialogProps {
    suppliers: ThirdParty[];
    materials: Material[];
}

export function CreatePurchaseOrderDialog({ suppliers, materials }: CreatePurchaseOrderDialogProps) {
    const [open, setOpen] = useState(false);
    const [supplierId, setSupplierId] = useState("");
    const [items, setItems] = useState<{ materialId: string; quantity: number; unitPrice: number }[]>([
        { materialId: "", quantity: 1, unitPrice: 0 }
    ]);
    const { t } = useLanguage();

    const handleAddItem = () => {
        setItems([...items, { materialId: "", quantity: 1, unitPrice: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: "materialId" | "quantity" | "unitPrice", value: string | number) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleSave = async () => {
        if (!supplierId || items.some(i => !i.materialId)) return;
        await createPurchaseOrder(supplierId, items);
        setOpen(false);
        setSupplierId("");
        setItems([{ materialId: "", quantity: 1, unitPrice: 0 }]);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> {t("purchasing.newOrder")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>{t("purchasing.newOrder")}</DialogTitle>
                    <DialogDescription>
                        {t("purchasing.newOrderDescription")}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="supplier" className="text-right">
                            {t("purchasing.supplier")}
                        </Label>
                        <Select onValueChange={setSupplierId} value={supplierId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder={t("purchasing.supplier")} />
                            </SelectTrigger>
                            <SelectContent>
                                {suppliers.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
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
                                <div className="col-span-5">
                                    <Label className="text-xs">{t("inventory.name")}</Label>
                                    <Select
                                        value={item.materialId}
                                        onValueChange={(val) => handleItemChange(index, "materialId", val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("inventory.name")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {materials.map(m => (
                                                <SelectItem key={m.id} value={m.id}>
                                                    {m.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                </div>
                <DialogFooter>
                    <Button onClick={handleSave}>{t("purchasing.createOrder")}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
