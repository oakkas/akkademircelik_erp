"use client";

import { useState } from "react";
import { updateStock } from "@/actions/inventory";
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
import { Material } from "@prisma/client";
import { useLanguage } from "@/context/LanguageContext";

import { Warehouse } from "@prisma/client";

interface AdjustStockDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    material: Material;
    warehouses: Warehouse[];
}

export function AdjustStockDialog({ open, onOpenChange, material, warehouses }: AdjustStockDialogProps) {
    const [type, setType] = useState<"IN" | "OUT" | "ADJUSTMENT">("IN");
    const [quantity, setQuantity] = useState(0);
    const [reason, setReason] = useState("");
    const [warehouseId, setWarehouseId] = useState<string>("");
    const [lotNumber, setLotNumber] = useState("");
    const [serialNumber, setSerialNumber] = useState("");
    const { t } = useLanguage();

    const handleSave = async () => {
        await updateStock(material.id, quantity, type, reason, warehouseId, lotNumber, serialNumber);
        onOpenChange(false);
        setQuantity(0);
        setReason("");
        setLotNumber("");
        setSerialNumber("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("inventory.adjustStock")}</DialogTitle>
                    <DialogDescription>
                        {material.name}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">
                            {t("inventory.type")}
                        </Label>
                        <Select onValueChange={(val: "IN" | "OUT" | "ADJUSTMENT") => setType(val)} defaultValue="IN">
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="IN">{t("inventory.stockIn")}</SelectItem>
                                <SelectItem value="OUT">{t("inventory.stockOut")}</SelectItem>
                                <SelectItem value="ADJUSTMENT">{t("inventory.adjustment")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">
                            {t("inventory.warehouse")}
                        </Label>
                        <Select onValueChange={setWarehouseId} value={warehouseId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder={t("inventory.warehouse")} />
                            </SelectTrigger>
                            <SelectContent>
                                {warehouses.map(w => (
                                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quantity" className="text-right">
                            {t("inventory.quantity")}
                        </Label>
                        <Input
                            id="quantity"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                            className="col-span-3"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="lotNumber" className="text-right">
                            {t("inventory.lotNumber")}
                        </Label>
                        <Input
                            id="lotNumber"
                            value={lotNumber}
                            onChange={(e) => setLotNumber(e.target.value)}
                            className="col-span-3"
                            placeholder={t("common.optional")}
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="serialNumber" className="text-right">
                            {t("inventory.serialNumber")}
                        </Label>
                        <Input
                            id="serialNumber"
                            value={serialNumber}
                            onChange={(e) => setSerialNumber(e.target.value)}
                            className="col-span-3"
                            placeholder={t("common.optional")}
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="reason" className="text-right">
                            {t("inventory.reason")}
                        </Label>
                        <Input
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave}>{t("inventory.update")}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
