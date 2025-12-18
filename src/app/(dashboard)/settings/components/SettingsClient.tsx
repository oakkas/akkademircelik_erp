"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/context/LanguageContext";

export function SettingsClient() {
    const { t } = useLanguage();

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h2>
                <p className="text-muted-foreground">
                    {t("settings.subtitle")}
                </p>
            </div>

            <div className="grid gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>{t("settings.companyInfo")}</CardTitle>
                        <CardDescription>
                            {t("settings.companyInfoDesc")}
                        </CardDescription>
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
                    </CardContent>
                    <CardFooter>
                        <Button>{t("settings.saveChanges")}</Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t("settings.systemPrefs")}</CardTitle>
                        <CardDescription>
                            {t("settings.systemPrefsDesc")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="low-stock-alerts" className="flex flex-col space-y-1">
                                <span>{t("settings.lowStockAlerts")}</span>
                                <span className="font-normal leading-snug text-muted-foreground">
                                    {t("settings.lowStockAlertsDesc")}
                                </span>
                            </Label>
                            <Switch id="low-stock-alerts" defaultChecked />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" disabled>{t("settings.enabled")}</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
