import { DashboardClient } from "./components/DashboardClient";
import { getDashboardStats } from "@/actions/dashboard";

export default async function DashboardPage() {
    const stats = await getDashboardStats();
    return <DashboardClient stats={stats} />;
}
