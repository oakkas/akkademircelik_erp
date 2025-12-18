"use client";

import { useState } from "react";
import { createContact } from "@/actions/crm";
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
    SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { ThirdParty } from "@prisma/client";
import { useLanguage } from "@/context/LanguageContext";

interface CreateContactDialogProps {
    thirdParties: ThirdParty[];
}

export function CreateContactDialog({ thirdParties }: CreateContactDialogProps) {
    const [open, setOpen] = useState(false);
    const [thirdPartyId, setThirdPartyId] = useState("");
    const { t } = useLanguage();

    async function onSubmit(formData: FormData) {
        if (!thirdPartyId) return;
        const result = await createContact(thirdPartyId, formData);
        if (result.success) {
            setOpen(false);
            setThirdPartyId("");
        } else {
            alert(result.error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> {t("crm.addContact")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("crm.newContact")}</DialogTitle>
                    <DialogDescription>
                        {t("crm.newContactDescription")}
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="thirdParty" className="text-right">
                            {t("crm.thirdParty")}
                        </Label>
                        <Select onValueChange={setThirdPartyId} value={thirdPartyId} required>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder={t("finance.selectThirdParty")} />
                            </SelectTrigger>
                            <SelectContent>
                                {thirdParties.map((tp) => (
                                    <SelectItem key={tp.id} value={tp.id}>
                                        {tp.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="firstName" className="text-right">
                            {t("crm.firstName")}
                        </Label>
                        <Input id="firstName" name="firstName" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="lastName" className="text-right">
                            {t("crm.lastName")}
                        </Label>
                        <Input id="lastName" name="lastName" className="col-span-3" required />
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
                        <Label htmlFor="role" className="text-right">
                            {t("crm.role")}
                        </Label>
                        <Input id="role" name="role" className="col-span-3" />
                    </div>

                    <DialogFooter>
                        <Button type="submit">{t("common.save")}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
