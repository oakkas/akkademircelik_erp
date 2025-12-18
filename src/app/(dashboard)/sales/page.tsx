import { getCustomers, getSalesOrders } from "@/actions/sales";
import { getProducts } from "@/actions/production";
import { SalesPageContent } from "./components/SalesPageContent";
import { PageTitle } from "@/components/PageTitle";

export default async function SalesPage() {
    const { data: customers } = await getCustomers();
    const { data: orders } = await getSalesOrders();
    const { data: products } = await getProducts();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <PageTitle titleKey="sales.title" />
            </div>

            <SalesPageContent
                customers={customers || []}
                orders={orders || []}
                products={products || []}
            />
        </div>
    );
}
