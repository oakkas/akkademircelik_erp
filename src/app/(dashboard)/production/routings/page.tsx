import { getRoutings, getProducts } from "@/actions/production";
import { CreateRoutingDialog } from "./components/CreateRoutingDialog";
import { RoutingList } from "./components/RoutingList";
import { PageTitle } from "@/components/PageTitle";

export default async function RoutingsPage() {
    const { data: routings } = await getRoutings();
    const { data: products } = await getProducts();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageTitle titleKey="production.routings" />
                <CreateRoutingDialog
                    products={products || []}
                />
            </div>

            <RoutingList routings={routings || []} />
        </div>
    );
}
