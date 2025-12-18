"use client";

import { useState } from "react";
import { createBOM } from "@/actions/production";
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
import { Product, Material } from "@prisma/client";
import { useLanguage } from "@/context/LanguageContext";

interface CreateBOMDialogProps {
    products: Product[];
    materials: Material[];
}

export function CreateBOMDialog({ products, materials }: CreateBOMDialogProps) {
    const [open, setOpen] = useState(false);
    const [productId, setProductId] = useState("");
    const [name, setName] = useState("Standard Recipe");
    const [items, setItems] = useState<{ materialId: string; quantity: number }[]>([{ materialId: "", quantity: 1 }]);
    const { t } = useLanguage();

    const handleAddItem = () => {
        setItems([...items, { materialId: "", quantity: 1 }]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: "materialId" | "quantity", value: string | number) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleSave = async () => {
        if (!productId || items.some(i => !i.materialId)) return;
        await createBOM(productId, name, items);
        setOpen(false);
        setProductId("");
        setItems([{ materialId: "", quantity: 1 }]);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> {t("production.newBom")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{t("production.newBom")}</DialogTitle>
                    <DialogDescription>
                        {t("production.newBomDescription")}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="product" className="text-right">
                            {t("production.product")}
                        </Label>
                        <Select onValueChange={setProductId} value={productId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder={t("production.product")} />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            {t("production.bomName")}
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label>{t("common.items")}</Label>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                                <Plus className="h-4 w-4 mr-2" /> {t("inventory.addMaterial")}
                            </Button>
                        </div>
                        {items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-end">
                                <div className="col-span-7">
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
                                                    {m.name} ({m.type})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-3">
                                    <Label className="text-xs">{t("inventory.quantity")}</Label>
                                    <Input
                                        type="number"
                                        min={0.1}
                                        step={0.1}
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value))}
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
                    <Button onClick={handleSave}>{t("common.create")}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
