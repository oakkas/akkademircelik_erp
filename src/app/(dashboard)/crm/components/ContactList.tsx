"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Contact, ThirdParty } from "@prisma/client";
import { useLanguage } from "@/context/LanguageContext";

interface ContactWithRelations extends Contact {
    thirdParty: ThirdParty;
}

interface ContactListProps {
    contacts: ContactWithRelations[];
}

export function ContactList({ contacts }: ContactListProps) {
    const { t } = useLanguage();

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t("inventory.name")}</TableHead>
                        <TableHead>{t("crm.thirdParty")}</TableHead>
                        <TableHead>{t("sales.email")}</TableHead>
                        <TableHead>{t("sales.phone")}</TableHead>
                        <TableHead>{t("crm.role")}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {contacts.map((contact) => (
                        <TableRow key={contact.id}>
                            <TableCell className="font-medium">{contact.firstName} {contact.lastName}</TableCell>
                            <TableCell>{contact.thirdParty.name}</TableCell>
                            <TableCell>{contact.email}</TableCell>
                            <TableCell>{contact.phone}</TableCell>
                            <TableCell>{contact.role}</TableCell>
                        </TableRow>
                    ))}
                    {contacts.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                {t("common.noData")}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
