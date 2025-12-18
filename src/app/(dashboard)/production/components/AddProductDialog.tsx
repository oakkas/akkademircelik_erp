"use client";

import { useState } from "react";
import { createProduct } from "@/actions/production";
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
import { Plus } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function AddProductDialog() {
    const [open, setOpen] = useState(false);
    const { t } = useLanguage();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> {t("production.newProduct")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("production.newProduct")}</DialogTitle>
                    <DialogDescription>
                        {t("production.addProductDescription")}
                    </DialogDescription>
                </DialogHeader>
                <form action={async (formData) => {
                    await createProduct(formData);
                    setOpen(false);
                }}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                {t("inventory.name")}
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">
                                {t("common.price")}
                            </Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">{t("common.save")}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
