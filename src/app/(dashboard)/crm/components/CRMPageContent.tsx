"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateThirdPartyDialog } from "./CreateThirdPartyDialog";
import { ThirdPartyList } from "./ThirdPartyList";
import { CreateContactDialog } from "./CreateContactDialog";
import { ContactList } from "./ContactList";
import { ThirdParty, Contact } from "@prisma/client";

interface ContactWithRelations extends Contact {
    thirdParty: ThirdParty;
}

interface CRMPageContentProps {
    thirdParties: ThirdParty[];
    contacts: ContactWithRelations[];
}

export function CRMPageContent({ thirdParties, contacts }: CRMPageContentProps) {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState("thirdParties");

    return (
        <div className="space-y-4">
            <div className="flex space-x-2 border-b">
                <button
                    className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${activeTab === "thirdParties" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
                    onClick={() => setActiveTab("thirdParties")}
                >
                    {t("crm.thirdParties")}
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${activeTab === "contacts" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
                    onClick={() => setActiveTab("contacts")}
                >
                    {t("crm.contacts")}
                </button>
            </div>

            {activeTab === "thirdParties" && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <CreateThirdPartyDialog />
                    </div>
                    <ThirdPartyList thirdParties={thirdParties} />
                </div>
            )}

            {activeTab === "contacts" && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <CreateContactDialog thirdParties={thirdParties} />
                    </div>
                    <ContactList contacts={contacts} />
                </div>
            )}
        </div>
    );
}
