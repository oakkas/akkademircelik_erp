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
import { Shipment, ThirdParty, Order } from "@prisma/client";
import { useLanguage } from "@/context/LanguageContext";

interface ShipmentWithRelations extends Shipment {
    thirdParty: ThirdParty;
    order: Order;
}

interface ShipmentListProps {
    shipments: ShipmentWithRelations[];
}

export function ShipmentList({ shipments }: ShipmentListProps) {
    const { t } = useLanguage();

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t("sales.shipmentId")}</TableHead>
                        <TableHead>{t("sales.orderId")}</TableHead>
                        <TableHead>{t("sales.customer")}</TableHead>
                        <TableHead>{t("common.date")}</TableHead>
                        <TableHead>{t("common.status")}</TableHead>
                        <TableHead>{t("sales.trackingNumber")}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {shipments.map((shipment) => (
                        <TableRow key={shipment.id}>
                            <TableCell className="font-medium">{shipment.id.slice(-6)}</TableCell>
                            <TableCell>{shipment.order.id.slice(-6)}</TableCell>
                            <TableCell>{shipment.thirdParty.name}</TableCell>
                            <TableCell>{new Date(shipment.date).toLocaleDateString()}</TableCell>
                            <TableCell>
                                <Badge variant={shipment.status === "DELIVERED" ? "default" : "secondary"}>
                                    {t(`status.${shipment.status}`)}
                                </Badge>
                            </TableCell>
                            <TableCell>{shipment.trackingNumber || "-"}</TableCell>
                        </TableRow>
                    ))}
                    {shipments.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                {t("sales.noShipments")}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
