import { getInvoices } from "@/actions/finance";
import { FinancePageContent } from "./components/FinancePageContent";
import { PageTitle } from "@/components/PageTitle";

export default async function FinancePage() {
    const { data: invoices } = await getInvoices();

    // Calculate stats
    const totalRevenue = invoices?.filter((i: any) => i.type === 'SALES' && i.status === 'PAID')
        .reduce((sum: number, i: any) => sum + i.totalAmount, 0) || 0;

    const pendingInvoices = invoices?.filter((i: any) => i.status !== 'PAID' && i.status !== 'CANCELLED').length || 0;

    const overdueAmount = invoices?.filter((i: any) => {
        if (i.status === 'PAID' || i.status === 'CANCELLED') return false;
        if (!i.dueDate) return false;
        return new Date(i.dueDate) < new Date();
    }).reduce((sum: number, i: any) => sum + (i.totalAmount - i.paidAmount), 0) || 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <PageTitle titleKey="finance.title" />
            </div>

            <FinancePageContent
                totalRevenue={totalRevenue}
                pendingInvoices={pendingInvoices}
                overdueAmount={overdueAmount}
            />
        </div>
    );
}
