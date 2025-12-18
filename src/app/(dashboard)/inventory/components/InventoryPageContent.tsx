"use client";

import { useState } from "react";
import { AddMaterialDialog } from "./AddMaterialDialog";
import { MaterialListTable } from "./MaterialListTable";
import { ProductListTable } from "./ProductListTable";
import { useLanguage } from "@/context/LanguageContext";
import { Material, Warehouse, Stock, Product } from "@prisma/client";

interface MaterialWithStocks extends Material {
    stocks: Stock[];
}

interface ProductWithStocks extends Product {
    stocks: Stock[];
}

interface InventoryPageContentProps {
    materials: MaterialWithStocks[];
    warehouses: Warehouse[];
    products: ProductWithStocks[];
}

export function InventoryPageContent({ materials, warehouses, products }: InventoryPageContentProps) {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState("materials");

    return (
        <div className="space-y-4">
            <div className="flex space-x-2 border-b">
                <button
                    className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${activeTab === "materials" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
                    onClick={() => setActiveTab("materials")}
                >
                    {t("inventory.materials")}
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${activeTab === "products" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
                    onClick={() => setActiveTab("products")}
                >
                    {t("inventory.products")}
                </button>
            </div>

            {activeTab === "materials" && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <AddMaterialDialog />
                    </div>
                    <MaterialListTable materials={materials} warehouses={warehouses} />
                </div>
            )}

            {activeTab === "products" && (
                <div className="space-y-4">
                    {/* @ts-ignore */}
                    <ProductListTable products={products} />
                </div>
            )}
        </div>
    );
}
