import { getBOMs, getProducts } from "@/actions/production";
import { getMaterials } from "@/actions/inventory";
import { CreateBOMDialog } from "./components/CreateBOMDialog";
import { BOMList } from "./components/BOMList";


import { PageTitle } from "@/components/PageTitle";

export default async function BOMsPage() {
    const { data: boms } = await getBOMs();
    const { data: products } = await getProducts();
    const { data: materials } = await getMaterials();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageTitle titleKey="production.boms" />
                <CreateBOMDialog
                    products={products || []}
                    materials={materials || []}
                />
            </div>



            <BOMList boms={boms || []} />
        </div>
    );
}
