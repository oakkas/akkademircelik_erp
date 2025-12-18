"use client";

import { useState } from "react";
import { createWarehouse } from "@/actions/inventory";
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

export function CreateWarehouseDialog() {
    const [open, setOpen] = useState(false);
    const { t } = useLanguage();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> {t("inventory.addWarehouse")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("inventory.addWarehouse")}</DialogTitle>
                    <DialogDescription>
                        {t("inventory.newWarehouseDescription")}
                    </DialogDescription>
                </DialogHeader>
                <form action={async (formData) => {
                    const name = formData.get("name") as string;
                    const address = formData.get("address") as string;
                    await createWarehouse(name, address);
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
                            <Label htmlFor="address" className="text-right">
                                {t("inventory.address")}
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
