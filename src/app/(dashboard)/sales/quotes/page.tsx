import { getQuotes, getCustomers } from "@/actions/sales";
import { getProducts } from "@/actions/production";
import { QuoteList } from "./components/QuoteList";
import { CreateQuoteDialog } from "./components/CreateQuoteDialog";

import { PageTitle } from "@/components/PageTitle";

export default async function QuotesPage() {
    const { data: quotes } = await getQuotes();
    const { data: customers } = await getCustomers();
    const { data: products } = await getProducts();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageTitle titleKey="sales.quotes" />
                <CreateQuoteDialog
                    customers={customers || []}
                    products={products || []}
                />
            </div>
            <QuoteList quotes={quotes || []} />
        </div>
    );
}
