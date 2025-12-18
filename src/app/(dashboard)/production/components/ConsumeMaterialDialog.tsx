"use client";

import { useState } from "react";
import { consumeMaterial, consumeBatch, getBOMForProduct } from "@/actions/production";
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
import { Stock, Warehouse, ProductionJob, Material, Product } from "@prisma/client";
import { useLanguage } from "@/context/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface MaterialWithStocks extends Material {
    stocks: (Stock & { warehouse: Warehouse })[];
}

interface ConsumeMaterialDialogProps {
    job: ProductionJob & { product: Product };
    materials: MaterialWithStocks[];
}

export function ConsumeMaterialDialog({ job, materials }: ConsumeMaterialDialogProps) {
    const [open, setOpen] = useState(false);
    const [materialId, setMaterialId] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [selectedStockId, setSelectedStockId] = useState<string>("");
    const { t } = useLanguage();

    // Batch Mode State
    const [batchMode, setBatchMode] = useState(false);
    const [batchItems, setBatchItems] = useState<{ materialId: string; quantity: number; name: string; stock: number }[]>([]);

    const handleSave = async () => {
        if (batchMode) {
            if (batchItems.length === 0) return;
            const itemsToConsume = batchItems.map(i => ({ materialId: i.materialId, quantity: i.quantity }));
            await consumeBatch(job.id, itemsToConsume);
        } else {
            if (!materialId) return;

            const material = materials.find(m => m.id === materialId);
            const stock = material?.stocks.find(s => s.id === selectedStockId);

            await consumeMaterial(job.id, materialId, quantity, stock?.lotNumber || undefined, stock?.serialNumber || undefined);
        }

        setOpen(false);
        setMaterialId("");
        setQuantity(0);
        setSelectedStockId("");
        setBatchMode(false);
        setBatchItems([]);
    };

    const handleLoadFromBOM = async () => {
        const result = await getBOMForProduct(job.productId);
        if (result.success && result.data) {
            const items = result.data.items.map((bomItem: any) => {
                const material = materials.find(m => m.id === bomItem.materialId);
                const totalStock = material?.stocks.reduce((acc, s) => acc + s.quantity, 0) || 0;
                return {
                    materialId: bomItem.materialId,
                    quantity: bomItem.quantity * job.quantity,
                    name: material?.name || "Unknown",
                    stock: totalStock
                };
            });
            setBatchItems(items);
            setBatchMode(true);
        }
    };

    const selectedMaterial = materials.find(m => m.id === materialId);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">{t("production.consume")}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{t("production.consume")}</DialogTitle>
                    <DialogDescription>
                        {job.product.name} - {job.quantity} {t("common.items")}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <Button variant="secondary" onClick={handleLoadFromBOM} className="mb-4">
                        {t("production.loadFromBom")}
                    </Button>

                    {batchMode ? (
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("production.material")}</TableHead>
                                        <TableHead>{t("production.required")}</TableHead>
                                        <TableHead>{t("production.stock")}</TableHead>
                                        <TableHead>{t("common.status")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {batchItems.map((item) => (
                                        <TableRow key={item.materialId}>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>{item.stock}</TableCell>
                                            <TableCell>
                                                {item.stock >= item.quantity
                                                    ? <Badge className="bg-green-500">OK</Badge>
                                                    : <Badge variant="destructive">{t("inventory.lowStock")}</Badge>
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">{t("production.material")}</Label>
                                <Select onValueChange={(val) => { setMaterialId(val); setSelectedStockId(""); }} value={materialId}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder={t("production.selectMaterial")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {materials.map(m => {
                                            const totalStock = m.stocks.reduce((acc, s) => acc + s.quantity, 0);
                                            return (
                                                <SelectItem key={m.id} value={m.id}>
                                                    {m.name} (Total: {totalStock})
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedMaterial && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">{t("inventory.sourceWarehouse")}</Label>
                                    <Select onValueChange={setSelectedStockId} value={selectedStockId}>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder={t("production.selectStock")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectedMaterial.stocks.map(s => (
                                                <SelectItem key={s.id} value={s.id}>
                                                    {s.warehouse.name} - Qty: {s.quantity}
                                                    {s.lotNumber ? ` - Lot: ${s.lotNumber}` : ""}
                                                    {s.serialNumber ? ` - SN: ${s.serialNumber}` : ""}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

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
                        </>
                    )}
                </div>
                <DialogFooter>
                    {batchMode && (
                        <Button variant="outline" onClick={() => setBatchMode(false)} className="mr-2">
                            {t("production.cancelBatch")}
                        </Button>
                    )}
                    <Button onClick={handleSave} disabled={batchMode && batchItems.some(i => i.stock < i.quantity)}>
                        {batchMode ? t("production.consumeAll") : t("common.save")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
