"use client";

import { useState } from "react";
import { createThirdParty } from "@/actions/crm";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function CreateThirdPartyDialog() {
    const [open, setOpen] = useState(false);
    const { t } = useLanguage();

    async function onSubmit(formData: FormData) {
        const result = await createThirdParty(formData);
        if (result.success) {
            setOpen(false);
        } else {
            alert(result.error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> {t("crm.addThirdParty")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("crm.addThirdParty")}</DialogTitle>
                    <DialogDescription>
                        {t("crm.newThirdPartyDescription")}
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            {t("inventory.name")}
                        </Label>
                        <Input id="name" name="name" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            {t("sales.email")}
                        </Label>
                        <Input id="email" name="email" type="email" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">
                            {t("sales.phone")}
                        </Label>
                        <Input id="phone" name="phone" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="address" className="text-right">
                            {t("sales.address")}
                        </Label>
                        <Input id="address" name="address" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="taxId" className="text-right">
                            {t("crm.taxId")}
                        </Label>
                        <Input id="taxId" name="taxId" className="col-span-3" />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">{t("inventory.type")}</Label>
                        <div className="col-span-3 flex gap-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="isCustomer" name="isCustomer" value="true" />
                                <Label htmlFor="isCustomer">{t("crm.isCustomer")}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="isSupplier" name="isSupplier" value="true" />
                                <Label htmlFor="isSupplier">{t("crm.isSupplier")}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="isProspect" name="isProspect" value="true" />
                                <Label htmlFor="isProspect">{t("crm.isProspect")}</Label>
                            </div>
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
