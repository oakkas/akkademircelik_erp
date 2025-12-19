"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Factory,
  ShoppingCart,
  Truck,
  Settings,
  Menu,
  FileText,
  Users,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const routes = [
    {
      label: t("common.dashboard"),
      icon: LayoutDashboard,
      href: "/dashboard",
      color: "text-sky-500",
    },
    {
      label: t("crm.title"),
      icon: Users,
      href: "/crm",
      color: "text-indigo-500",
    },
    {
      label: t("common.inventory"),
      icon: Package,
      href: "/inventory",
      color: "text-violet-500",
    },
    {
      label: t("inventory.warehouses"),
      icon: Package, // Or Building/Warehouse icon if available
      href: "/inventory/warehouses",
      color: "text-violet-400",
    },
    {
      label: t("common.production"),
      icon: Factory,
      href: "/production",
      color: "text-pink-700",
    },
    {
      label: t("production.boms"),
      icon: Factory,
      href: "/production/boms",
      color: "text-pink-500",
    },
    {
      label: t("production.routings"),
      icon: Factory,
      href: "/production/routings",
      color: "text-pink-400",
    },
    {
      label: t("common.sales"),
      icon: ShoppingCart,
      href: "/sales",
      color: "text-orange-700",
    },
    {
      label: t("sales.quotes"),
      icon: FileText,
      href: "/sales/quotes",
      color: "text-orange-500",
    },
    {
      label: t("sales.shipments"),
      icon: Truck,
      href: "/sales/shipments",
      color: "text-orange-400",
    },
    {
      label: t("common.purchasing"),
      icon: Truck,
      href: "/purchasing",
      color: "text-emerald-500",
    },
    {
      label: t("finance.title"),
      icon: DollarSign,
      href: "/finance",
      color: "text-green-600",
    },
    {
      label: t("common.reports"),
      icon: FileText, // Using FileText as a placeholder for Reports icon
      href: "/reports",
      color: "text-blue-500",
    },
    {
      label: t("common.settings"),
      icon: Settings,
      href: "/settings",
    },
  ];

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <h1 className="text-xl font-bold break-words">
            {t("common.appName")}
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}

          <form action={async () => {
            // We need to import handleSignOut dynamically or pass it as a prop if this was a server component,
            // but since it's a client component, we can import the server action.
            const { handleSignOut } = await import('@/lib/actions');
            await handleSignOut();
          }}>
            <button
              type="submit"
              className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition text-zinc-400"
            >
              <div className="flex items-center flex-1">
                <Users className="h-5 w-5 mr-3 text-red-500" />
                {t("common.logout")}
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-[#111827]">
        <Sidebar />
      </SheetContent>
    </Sheet>
  )
}
