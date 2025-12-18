
"use client";

import { useState } from "react";
import { createJob } from "@/actions/production";
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
import { Plus } from "lucide-react";
import { Product } from "@prisma/client";
import { useLanguage } from "@/context/LanguageContext";

interface CreateJobDialogProps {
    products: Product[];
}

export function CreateJobDialog({ products }: CreateJobDialogProps) {
    const [open, setOpen] = useState(false);
    const [productId, setProductId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const { t } = useLanguage();

    const handleSave = async () => {
        if (!productId) return;
        const formData = new FormData();
        formData.append("productId", productId);
        formData.append("quantity", quantity.toString());
        await createJob(formData);
        setOpen(false);
        setProductId("");
        setQuantity(1);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> {t("production.newJob")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("production.newJob")}</DialogTitle>
                    <DialogDescription>
                        {t("production.newJobDescription")}
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
                        <Label htmlFor="quantity" className="text-right">
                            {t("production.quantity")}
                        </Label>
                        <Input
                            id="quantity"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                            min={1}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave}>{t("common.save")}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
