import { getMaterials, getWarehouses } from "@/actions/inventory";
import { getProducts } from "@/actions/production";
import { InventoryPageContent } from "./components/InventoryPageContent";
import { PageTitle } from "@/components/PageTitle";

export default async function InventoryPage() {
    const { data: materials } = await getMaterials();
    const { data: warehouses } = await getWarehouses();
    const { data: products } = await getProducts();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <PageTitle titleKey="inventory.title" />
            </div>

            <InventoryPageContent
                materials={materials || []}
                warehouses={warehouses || []}
                products={products || []}
            />
        </div>
    );
}
