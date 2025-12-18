"use client";

import { useState } from "react";

import { AddCustomerDialog } from "./AddCustomerDialog";
import { CreateSalesOrderDialog } from "./CreateSalesOrderDialog";
import { CustomerList } from "./CustomerList";
import { SalesOrderList } from "./SalesOrderList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/context/LanguageContext";
import { Order, ThirdParty, OrderItem, Product } from "@prisma/client";

interface OrderWithRelations extends Order {
    thirdParty: ThirdParty | null;
    items: (OrderItem & { product: { name: string } | null })[];
}

interface SalesPageContentProps {
    customers: ThirdParty[];
    orders: OrderWithRelations[];
    products: Product[];
}

export function SalesPageContent({ customers, orders, products }: SalesPageContentProps) {
    const { t } = useLanguage();


    const [activeTab, setActiveTab] = useState("orders");

    return (
        <div className="space-y-4">
            <div className="flex space-x-2 border-b">
                <button
                    className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${activeTab === "orders" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
                    onClick={() => setActiveTab("orders")}
                >
                    {t("sales.salesOrders")}
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${activeTab === "customers" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
                    onClick={() => setActiveTab("customers")}
                >
                    {t("sales.customers")}
                </button>
            </div>

            {activeTab === "orders" && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <CreateSalesOrderDialog
                            customers={customers}
                            products={products}
                        />
                    </div>
                    {/* @ts-ignore */}
                    <SalesOrderList orders={orders} />
                </div>
            )}

            {activeTab === "customers" && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <AddCustomerDialog />
                    </div>
                    <CustomerList customers={customers} />
                </div>
            )}
        </div>
    );
}
