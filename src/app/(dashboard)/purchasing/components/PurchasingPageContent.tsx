"use client";

import { useState } from "react";

import { AddSupplierDialog } from "./AddSupplierDialog";
import { CreatePurchaseOrderDialog } from "./CreatePurchaseOrderDialog";
import { SupplierList } from "./SupplierList";
import { PurchaseOrderList } from "./PurchaseOrderList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/context/LanguageContext";
import { Order, ThirdParty, OrderItem, Material } from "@prisma/client";

interface OrderWithRelations extends Order {
    thirdParty: ThirdParty | null;
    items: OrderItem[];
}

interface PurchasingPageContentProps {
    suppliers: ThirdParty[];
    orders: OrderWithRelations[];
    materials: Material[];
}

export function PurchasingPageContent({ suppliers, orders, materials }: PurchasingPageContentProps) {
    const { t } = useLanguage();


    const [activeTab, setActiveTab] = useState("orders");

    return (
        <div className="space-y-4">
            <div className="flex space-x-2 border-b">
                <button
                    className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${activeTab === "orders" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
                    onClick={() => setActiveTab("orders")}
                >
                    {t("purchasing.purchaseOrders")}
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${activeTab === "suppliers" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
                    onClick={() => setActiveTab("suppliers")}
                >
                    {t("purchasing.suppliers")}
                </button>
            </div>

            {activeTab === "orders" && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <CreatePurchaseOrderDialog
                            suppliers={suppliers}
                            materials={materials}
                        />
                    </div>
                    {/* @ts-ignore */}
                    <PurchaseOrderList orders={orders} />
                </div>
            )}

            {activeTab === "suppliers" && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <AddSupplierDialog />
                    </div>
                    <SupplierList suppliers={suppliers} />
                </div>
            )}
        </div>
    );
}
