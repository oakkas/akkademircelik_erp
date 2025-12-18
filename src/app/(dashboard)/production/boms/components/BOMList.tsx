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
import { ProductionBOM, Product, BOMItem, Material } from "@prisma/client";
import { useLanguage } from "@/context/LanguageContext";

interface BOMWithRelations extends ProductionBOM {
    product: Product;
    items: (BOMItem & { material: Material })[];
}

interface BOMListProps {
    boms: BOMWithRelations[];
}

export function BOMList({ boms }: BOMListProps) {
    const { t } = useLanguage();

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t("production.product")}</TableHead>
                        <TableHead>{t("production.bomName")}</TableHead>
                        <TableHead>{t("production.material")}</TableHead>
                        <TableHead>{t("production.createdAt")}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {boms.map((bom) => (
                        <TableRow key={bom.id}>
                            <TableCell className="font-medium">{bom.product.name}</TableCell>
                            <TableCell>{bom.name}</TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1">
                                    {bom.items.map(item => (
                                        <Badge key={item.id} variant="outline" className="w-fit">
                                            {item.quantity}x {item.material.name}
                                        </Badge>
                                    ))}
                                </div>
                            </TableCell>
                            <TableCell>{new Date(bom.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                    ))}
                    {boms.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                {t("production.noBoms")}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
