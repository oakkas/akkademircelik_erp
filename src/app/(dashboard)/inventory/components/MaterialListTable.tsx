
"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus, Minus } from "lucide-react";
import { Material, Stock, Warehouse } from "@prisma/client";
import { AdjustStockDialog } from "./AdjustStockDialog";
import { useState } from "react";
import { deleteMaterial } from "@/actions/inventory";
import { useLanguage } from "@/context/LanguageContext";

interface MaterialWithStocks extends Material {
    stocks: Stock[];
}

interface MaterialListTableProps {
    materials: MaterialWithStocks[];
    warehouses: Warehouse[];
}

export function MaterialListTable({ materials, warehouses }: MaterialListTableProps) {
    const [selectedMaterial, setSelectedMaterial] = useState<MaterialWithStocks | null>(null);
    const [isAdjustOpen, setIsAdjustOpen] = useState(false);
    const { t } = useLanguage();

    const handleDelete = async (id: string) => {
        if (confirm(t("common.confirm"))) {
            await deleteMaterial(id);
        }
    };

    const openAdjustDialog = (material: MaterialWithStocks) => {
        setSelectedMaterial(material);
        setIsAdjustOpen(true);
    };

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("inventory.name")}</TableHead>
                            <TableHead>{t("inventory.type")}</TableHead>
                            <TableHead>{t("inventory.dimensions")}</TableHead>
                            <TableHead>{t("inventory.thickness")}</TableHead>
                            <TableHead>{t("inventory.quantity")}</TableHead>
                            <TableHead>{t("inventory.status")}</TableHead>
                            <TableHead className="text-right">{t("inventory.actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {materials.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    {t("common.noData")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            materials.map((material) => {
                                const totalQuantity = material.stocks.reduce((sum, stock) => sum + stock.quantity, 0);
                                return (
                                    <TableRow key={material.id}>
                                        <TableCell className="font-medium">{material.name}</TableCell>
                                        <TableCell>{material.type}</TableCell>
                                        <TableCell>
                                            {material.width && material.length
                                                ? `${material.width} x ${material.length}`
                                                : "-"}
                                        </TableCell>
                                        <TableCell>{material.thickness} mm</TableCell>
                                        <TableCell>{totalQuantity}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    totalQuantity > (material.minStock || 0)
                                                        ? "default"
                                                        : "destructive"
                                                }
                                            >
                                                {totalQuantity > (material.minStock || 0)
                                                    ? t("inventory.inStock")
                                                    : t("inventory.lowStock")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => openAdjustDialog(material)}
                                                    title={t("inventory.adjustStock")}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(material.id)}
                                                    title={t("common.delete")}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {selectedMaterial && (
                <AdjustStockDialog
                    open={isAdjustOpen}
                    onOpenChange={setIsAdjustOpen}
                    material={selectedMaterial}
                    warehouses={warehouses}
                />
            )}
        </>
    );
}
