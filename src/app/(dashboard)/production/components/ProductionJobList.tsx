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
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Play, CheckCircle, Archive } from "lucide-react";
import { ProductionJob, Product, Material, Stock, Warehouse } from "@prisma/client";
import { updateJobStatus, deleteJob } from "@/actions/production";
import { ConsumeMaterialDialog } from "./ConsumeMaterialDialog";
import { useLanguage } from "@/context/LanguageContext";

interface ProductionJobWithRelations extends ProductionJob {
  product: Product;
}

interface MaterialWithStocks extends Material {
  stocks: (Stock & { warehouse: Warehouse })[];
}

interface ProductionJobListProps {
  jobs: ProductionJobWithRelations[];
  materials: MaterialWithStocks[];
}

export function ProductionJobList({ jobs, materials }: ProductionJobListProps) {
  const { t } = useLanguage();

  const handleStatusUpdate = async (id: string, status: "PLANNED" | "IN_PROGRESS" | "COMPLETED") => {
    await updateJobStatus(id, status);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t("common.confirm"))) {
      await deleteJob(id);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("production.jobId")}</TableHead>
            <TableHead>{t("production.product")}</TableHead>
            <TableHead>{t("production.quantity")}</TableHead>
            <TableHead>{t("production.status")}</TableHead>
            <TableHead>{t("production.startDate")}</TableHead>
            <TableHead>{t("production.endDate")}</TableHead>
            <TableHead className="text-right">{t("production.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                {t("common.noData")}
              </TableCell>
            </TableRow>
          ) : (
            jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.id.substring(0, 8)}</TableCell>
                <TableCell>{job.product.name}</TableCell>
                <TableCell>{job.quantity}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      job.status === "COMPLETED"
                        ? "default"
                        : job.status === "IN_PROGRESS"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {job.status === "PLANNED" ? t("production.planned") :
                      job.status === "IN_PROGRESS" ? t("production.inProgress") :
                        job.status === "COMPLETED" ? t("production.completed") : job.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {job.startDate ? new Date(job.startDate).toLocaleDateString() : "-"}
                </TableCell>
                <TableCell>
                  {job.endDate ? new Date(job.endDate).toLocaleDateString() : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {job.status === "PLANNED" && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleStatusUpdate(job.id, "IN_PROGRESS")}
                        title={t("production.inProgress")}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    {job.status === "IN_PROGRESS" && (
                      <>
                        <ConsumeMaterialDialog job={job} materials={materials} />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleStatusUpdate(job.id, "COMPLETED")}
                          title={t("production.completed")}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(job.id)}
                      title={t("common.delete")}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
