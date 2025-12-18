import { getInvoices } from "@/actions/finance";
import { getThirdParties } from "@/actions/crm";
import { CreateInvoiceDialog } from "../components/CreateInvoiceDialog";
import { InvoiceList } from "../components/InvoiceList";

import { PageTitle } from "@/components/PageTitle";

export default async function InvoicesPage() {
    const { data: invoices } = await getInvoices();
    const { data: thirdParties } = await getThirdParties();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <PageTitle titleKey="finance.invoices" />
                <CreateInvoiceDialog thirdParties={thirdParties || []} />
            </div>

            <InvoiceList invoices={invoices || []} />
        </div>
    );
}
