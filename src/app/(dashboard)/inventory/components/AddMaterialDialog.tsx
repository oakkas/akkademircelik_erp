
"use client";

import { useState } from "react";
import { createMaterial } from "@/actions/inventory";
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

export function AddMaterialDialog() {
    const [open, setOpen] = useState(false);
    const { t } = useLanguage();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> {t("inventory.addMaterial")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("inventory.addMaterial")}</DialogTitle>
                    <DialogDescription>
                        {t("inventory.addMaterial")}
                    </DialogDescription>
                </DialogHeader>
                <form action={async (formData) => {
                    await createMaterial({ message: "" }, formData);
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
                            <Label htmlFor="type" className="text-right">
                                {t("inventory.type")}
                            </Label>
                            <Input
                                id="type"
                                name="type"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="thickness" className="text-right">
                                {t("inventory.thickness")}
                            </Label>
                            <Input
                                id="thickness"
                                name="thickness"
                                type="number"
                                step="0.1"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="width" className="text-right">
                                {t("inventory.width")}
                            </Label>
                            <Input
                                id="width"
                                name="width"
                                type="number"
                                step="1"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="length" className="text-right">
                                {t("inventory.length")}
                            </Label>
                            <Input
                                id="length"
                                name="length"
                                type="number"
                                defaultValue="2000"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="quantity" className="text-right">
                                {t("inventory.quantity")}
                            </Label>
                            <Input
                                id="quantity"
                                name="quantity"
                                type="number"
                                defaultValue="0"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="minStock" className="text-right">
                                {t("inventory.minStock")}
                            </Label>
                            <Input
                                id="minStock"
                                name="minStock"
                                type="number"
                                defaultValue="10"
                                className="col-span-3"
                                required
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
