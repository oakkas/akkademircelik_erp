"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Routing, Product, RoutingStep } from "@prisma/client";
import { useLanguage } from "@/context/LanguageContext";

interface RoutingWithRelations extends Routing {
    product: Product;
    steps: RoutingStep[];
}

interface RoutingListProps {
    routings: RoutingWithRelations[];
}

export function RoutingList({ routings }: RoutingListProps) {
    const { t } = useLanguage();

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t("production.product")}</TableHead>
                        <TableHead>{t("production.routingName")}</TableHead>
                        <TableHead>{t("production.operationsFlow")}</TableHead>
                        <TableHead>{t("production.createdAt")}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {routings.map((routing) => (
                        <TableRow key={routing.id}>
                            <TableCell className="font-medium">{routing.product.name}</TableCell>
                            <TableCell>{routing.name}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {routing.steps.map((step, index) => (
                                        <div key={step.id} className="flex items-center gap-2">
                                            <Badge variant="outline">
                                                {step.order}. {step.type}
                                            </Badge>
                                            {index < routing.steps.length - 1 && (
                                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </TableCell>
                            <TableCell>{new Date(routing.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                    ))}
                    {routings.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                {t("production.noRoutings")}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
