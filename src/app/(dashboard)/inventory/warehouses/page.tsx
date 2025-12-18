import { getWarehouses } from "@/actions/inventory";
import { CreateWarehouseDialog } from "./components/CreateWarehouseDialog";
import { WarehouseList } from "./components/WarehouseList";

import { PageTitle } from "@/components/PageTitle";

export default async function WarehousesPage() {
    const { data: warehouses } = await getWarehouses();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <PageTitle titleKey="inventory.warehouses" />
                <CreateWarehouseDialog />
            </div>

            <WarehouseList warehouses={warehouses || []} />
        </div>
    );
}
