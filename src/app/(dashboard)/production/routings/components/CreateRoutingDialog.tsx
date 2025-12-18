"use client";

import { useState } from "react";
import { createRouting } from "@/actions/production";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Plus, Trash2, ArrowDown, ArrowUp } from "lucide-react";
import { Product } from "@prisma/client";
import { useLanguage } from "@/context/LanguageContext";

interface CreateRoutingDialogProps {
    products: Product[];
}

const OPERATION_TYPES = ["CUT", "BEND", "WELD", "PAINT", "ASSEMBLY", "PACKING", "INSPECTION"];

export function CreateRoutingDialog({ products }: CreateRoutingDialogProps) {
    const [open, setOpen] = useState(false);
    const [productId, setProductId] = useState("");
    const [name, setName] = useState("Standard Routing");
    const [steps, setSteps] = useState<{ order: number; type: string; description: string }[]>([
        { order: 1, type: "CUT", description: "" }
    ]);
    const { t } = useLanguage();

    const handleAddStep = () => {
        setSteps([...steps, { order: steps.length + 1, type: "CUT", description: "" }]);
    };

    const handleRemoveStep = (index: number) => {
        const newSteps = steps.filter((_, i) => i !== index).map((step, i) => ({ ...step, order: i + 1 }));
        setSteps(newSteps);
    };

    const handleStepChange = (index: number, field: "type" | "description", value: string) => {
        const newSteps = [...steps];
        // @ts-ignore
        newSteps[index][field] = value;
        setSteps(newSteps);
    };

    const handleMoveStep = (index: number, direction: "up" | "down") => {
        if (direction === "up" && index === 0) return;
        if (direction === "down" && index === steps.length - 1) return;

        const newSteps = [...steps];
        const temp = newSteps[index];
        newSteps[index] = newSteps[index + (direction === "up" ? -1 : 1)];
        newSteps[index + (direction === "up" ? -1 : 1)] = temp;

        // Re-assign orders
        const reordered = newSteps.map((step, i) => ({ ...step, order: i + 1 }));
        setSteps(reordered);
    };

    const handleSave = async () => {
        if (!productId || steps.length === 0) return;
        await createRouting(productId, name, steps);
        setOpen(false);
        setProductId("");
        setSteps([{ order: 1, type: "CUT", description: "" }]);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> {t("production.newRouting")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>{t("production.newRouting")}</DialogTitle>
                    <DialogDescription>
                        {t("production.newRoutingDescription")}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="product" className="text-right">
                            {t("production.product")}
                        </Label>
                        <Select onValueChange={setProductId} value={productId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder={t("production.product")} />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            {t("production.routingName")}
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label>{t("production.operations")}</Label>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddStep}>
                                <Plus className="h-4 w-4 mr-2" /> {t("production.addStep")}
                            </Button>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                            {steps.map((step, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 items-center border p-2 rounded-md">
                                    <div className="col-span-1 text-center font-bold text-muted-foreground">
                                        {step.order}
                                    </div>
                                    <div className="col-span-4">
                                        <Select
                                            value={step.type}
                                            onValueChange={(val) => handleStepChange(index, "type", val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {OPERATION_TYPES.map(type => (
                                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-span-5">
                                        <Input
                                            placeholder={t("common.description")}
                                            value={step.description}
                                            onChange={(e) => handleStepChange(index, "description", e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-2 flex gap-1 justify-end">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleMoveStep(index, "up")}
                                            disabled={index === 0}
                                            className="h-8 w-8"
                                        >
                                            <ArrowUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleMoveStep(index, "down")}
                                            disabled={index === steps.length - 1}
                                            className="h-8 w-8"
                                        >
                                            <ArrowDown className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => handleRemoveStep(index)}
                                            disabled={steps.length === 1}
                                            className="h-8 w-8"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave}>{t("production.newRouting")}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
