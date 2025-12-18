"use client";

import { useState, useEffect } from "react";
import { createShipment } from "@/actions/shipments";
import { getStockForProducts } from "@/actions/inventory";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Order, OrderItem, Product, Stock, Warehouse } from "@prisma/client";
import { useLanguage } from "@/context/LanguageContext";

interface CreateShipmentDialogProps {
    orders: (Order & { items: (OrderItem & { product: Product | null })[] })[];
}

interface StockWithWarehouse extends Stock {
    warehouse: Warehouse;
}

export function CreateShipmentDialog({ orders }: CreateShipmentDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string>("");
    const [itemStockSelections, setItemStockSelections] = useState<Record<string, { warehouseId: string; lotNumber?: string; serialNumber?: string }>>({});
    const [availableStocks, setAvailableStocks] = useState<Record<string, StockWithWarehouse[]>>({});

    const selectedOrder = orders.find(o => o.id === selectedOrderId);

    // Fetch available stock for products in the selected order
    useEffect(() => {
        async function fetchStocks() {
            if (selectedOrder) {
                const productIds = selectedOrder.items
                    .filter(item => item.productId)
                    .map(item => item.productId!);

                if (productIds.length > 0) {
                    const result = await getStockForProducts(productIds);
                    if (result.success && result.data) {
                        // Group stocks by productId
                        const stocksByProduct: Record<string, StockWithWarehouse[]> = {};
                        result.data.forEach((stock: any) => {
                            if (stock.productId) {
                                if (!stocksByProduct[stock.productId]) {
                                    stocksByProduct[stock.productId] = [];
                                }
                                stocksByProduct[stock.productId].push(stock);
                            }
                        });
                        setAvailableStocks(stocksByProduct);
                    }
                }
            }
        }
        fetchStocks();
    }, [selectedOrder]);

    const { t } = useLanguage();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> {t("sales.createShipment")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>{t("sales.createShipment")}</DialogTitle>
                    <DialogDescription>
                        {t("sales.newShipmentDescription")}
                    </DialogDescription>
                </DialogHeader>
                <form action={async () => {
                    if (!selectedOrder) return;

                    const itemsToShip = selectedOrder.items
                        .filter(item => item.productId)
                        .map(item => {
                            const selection = itemStockSelections[item.id];
                            return {
                                productId: item.productId!,
                                quantity: item.quantity,
                                warehouseId: selection?.warehouseId,
                                lotNumber: selection?.lotNumber,
                                serialNumber: selection?.serialNumber
                            };
                        });

                    await createShipment(selectedOrderId, itemsToShip);
                    setOpen(false);
                    setSelectedOrderId("");
                    setItemStockSelections({});
                }}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="order" className="text-right">
                                {t("sales.orderId")}
                            </Label>
                            <Select onValueChange={setSelectedOrderId} value={selectedOrderId}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder={t("sales.orderId")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {orders.map((order) => (
                                        <SelectItem key={order.id} value={order.id}>
                                            {order.id.slice(-6)} - {new Date(order.createdAt).toLocaleDateString()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedOrder && (
                            <div className="col-span-4 border rounded p-4 mt-4">
                                <h4 className="font-semibold mb-2">Items to Ship:</h4>
                                <div className="space-y-4">
                                    {selectedOrder.items.map(item => {
                                        const stocks = availableStocks[item.productId!] || [];
                                        return (
                                            <div key={item.id} className="grid grid-cols-12 gap-2 items-center border-b pb-2">
                                                <div className="col-span-4 text-sm">
                                                    {item.product?.name || "Unknown Product"}
                                                </div>
                                                <div className="col-span-2 text-sm">
                                                    Qty: {item.quantity}
                                                </div>
                                                <div className="col-span-6">
                                                    <Select onValueChange={(value) => {
                                                        const [warehouseId, lot, serial] = value.split("|");
                                                        setItemStockSelections(prev => ({
                                                            ...prev,
                                                            [item.id]: {
                                                                warehouseId,
                                                                lotNumber: lot === "null" ? undefined : lot,
                                                                serialNumber: serial === "null" ? undefined : serial
                                                            }
                                                        }));
                                                    }}>
                                                        <SelectTrigger className="h-8">
                                                            <SelectValue placeholder="Select Stock Source" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {stocks.map((stock) => (
                                                                <SelectItem
                                                                    key={stock.id}
                                                                    value={`${stock.warehouseId}|${stock.lotNumber}|${stock.serialNumber}`}
                                                                >
                                                                    {stock.warehouse.name} - Qty: {stock.quantity}
                                                                    {stock.lotNumber ? ` (Lot: ${stock.lotNumber})` : ""}
                                                                    {stock.serialNumber ? ` (SN: ${stock.serialNumber})` : ""}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={!selectedOrderId}>{t("sales.createShipment")}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
