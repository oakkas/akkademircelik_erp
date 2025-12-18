import { getShipments } from "@/actions/shipments";
import { getSalesOrders } from "@/actions/sales";
import { CreateShipmentDialog } from "./components/CreateShipmentDialog";
import { ShipmentList } from "./components/ShipmentList";

import { PageTitle } from "@/components/PageTitle";

export default async function ShipmentsPage() {
    const { data: shipments } = await getShipments();
    const { data: orders } = await getSalesOrders();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <PageTitle titleKey="sales.shipments" />
                <CreateShipmentDialog orders={orders || []} />
            </div>

            <ShipmentList shipments={shipments || []} />
        </div>
    );
}
