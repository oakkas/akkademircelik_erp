"use client";

import { useState } from "react";
import { createSupplier } from "@/actions/purchasing";
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

export function AddSupplierDialog() {
    const [open, setOpen] = useState(false);
    const { t } = useLanguage();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> {t("purchasing.newSupplier")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("purchasing.newSupplier")}</DialogTitle>
                    <DialogDescription>
                        {t("purchasing.newSupplierDescription")}
                    </DialogDescription>
                </DialogHeader>
                <form action={async (formData) => {
                    await createSupplier(formData);
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
                            <Label htmlFor="email" className="text-right">
                                {t("sales.email")}
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">
                                {t("sales.phone")}
                            </Label>
                            <Input
                                id="phone"
                                name="phone"
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="address" className="text-right">
                                {t("sales.address")}
                            </Label>
                            <Input
                                id="address"
                                name="address"
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
