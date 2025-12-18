import { getSuppliers, getPurchaseOrders } from "@/actions/purchasing";
import { getMaterials } from "@/actions/inventory";
import { PurchasingPageContent } from "./components/PurchasingPageContent";
import { PageTitle } from "@/components/PageTitle";

export default async function PurchasingPage() {
    const { data: suppliers } = await getSuppliers();
    const { data: orders } = await getPurchaseOrders();
    const { data: materials } = await getMaterials();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <PageTitle titleKey="purchasing.title" />
            </div>

            <PurchasingPageContent
                suppliers={suppliers || []}
                orders={orders || []}
                materials={materials || []}
            />
        </div>
    );
}
