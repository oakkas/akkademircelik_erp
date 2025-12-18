import { getThirdParties, getContacts } from "@/actions/crm";
import { CRMPageContent } from "./components/CRMPageContent";
import { PageTitle } from "@/components/PageTitle";

export default async function CRMPage() {
    const { data: thirdParties } = await getThirdParties();
    const { data: contacts } = await getContacts();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <PageTitle titleKey="crm.title" />
            </div>

            <CRMPageContent
                thirdParties={thirdParties || []}
                contacts={contacts || []}
            />
        </div>
    );
}
