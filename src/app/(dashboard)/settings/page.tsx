"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { PageTitle } from "@/components/PageTitle";

export default function SettingsPage() {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <div>
                <PageTitle titleKey="settings.title" />
                <p className="text-sm text-muted-foreground">
                    {t("settings.subtitle")}
                </p>
            </div>
            <Separator />

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t("settings.companyInfo")}</CardTitle>
                        <CardDescription>{t("settings.companyInfoDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="companyName">{t("settings.companyName")}</Label>
                            <Input id="companyName" defaultValue="Akkademircelik Metal Processing" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">{t("settings.address")}</Label>
                            <Input id="address" defaultValue="123 Industrial Zone" />
                        </div>
                        <Button>{t("settings.saveChanges")}</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t("settings.systemPrefs")}</CardTitle>
                        <CardDescription>{t("settings.systemPrefsDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">{t("settings.lowStockAlerts")}</Label>
                                <p className="text-sm text-muted-foreground">{t("settings.lowStockAlertsDesc")}</p>
                            </div>
                            <Button variant="outline">{t("settings.enabled")}</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
