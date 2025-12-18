"use client";

import { useLanguage } from "@/context/LanguageContext";

interface PageTitleProps {
    titleKey: string;
}

export function PageTitle({ titleKey }: PageTitleProps) {
    const { t } = useLanguage();
    return <h2 className="text-3xl font-bold tracking-tight">{t(titleKey)}</h2>;
}
