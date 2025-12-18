"use client";

import { AddProductDialog } from "./AddProductDialog";
import { CreateJobDialog } from "./CreateJobDialog";
import { ProductList } from "./ProductList";
import { ProductionJobList } from "./ProductionJobList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/context/LanguageContext";
import { ProductionJob, Product, Material } from "@prisma/client";

interface ProductionJobWithRelations extends ProductionJob {
    product: Product;
}

interface ProductionPageContentProps {
    products: Product[];
    jobs: ProductionJobWithRelations[];
    materials: Material[];
}

export function ProductionPageContent({ products, jobs, materials }: ProductionPageContentProps) {
    const { t } = useLanguage();

    return (
        <Tabs defaultValue="jobs" className="space-y-4">
            <TabsList>
                <TabsTrigger value="jobs">{t("production.jobOrders")}</TabsTrigger>
                <TabsTrigger value="products">{t("production.products")}</TabsTrigger>
            </TabsList>
            <TabsContent value="jobs" className="space-y-4">
                <div className="flex justify-end">
                    <CreateJobDialog products={products} />
                </div>
                <ProductionJobList jobs={jobs} materials={materials} />
            </TabsContent>
            <TabsContent value="products" className="space-y-4">
                <div className="flex justify-end">
                    <AddProductDialog />
                </div>
                <ProductList products={products} />
            </TabsContent>
        </Tabs>
    );
}
