import { getProducts, getJobs } from "@/actions/production";
import { getMaterials } from "@/actions/inventory";
import { ProductionPageContent } from "./components/ProductionPageContent";
import { PageTitle } from "@/components/PageTitle";

export default async function ProductionPage() {
    const { data: products } = await getProducts();
    const { data: jobs } = await getJobs();
    const { data: materials } = await getMaterials();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <PageTitle titleKey="production.title" />
            </div>

            <ProductionPageContent
                products={products || []}
                jobs={jobs || []}
                materials={materials || []}
            />
        </div>
    );
}
