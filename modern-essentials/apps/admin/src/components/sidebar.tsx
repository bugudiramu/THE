"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  PackageCheck,
  Truck,
  ChevronLeft,
  Egg,
  Warehouse,
  PlusCircle,
  FileCheck,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Today's Orders",
    href: "/orders",
    icon: ClipboardList,
  },
  {
    label: "Pick List",
    href: "/pick-list",
    icon: PackageCheck,
  },
  {
    label: "Dispatch",
    href: "/dispatch",
    icon: Truck,
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: Warehouse,
  },
  {
    label: "GRN Intake",
    href: "/inventory/grn",
    icon: PlusCircle,
  },
  {
    label: "QC Log",
    href: "/qc",
    icon: FileCheck,
  },
  {
    label: "Wastage",
    href: "/wastage",
    icon: Trash2,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-16 items-center px-4 py-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Egg className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight">Modern Ops</span>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  !collapsed && "mr-3",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground group-hover:text-accent-foreground",
                )}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        {!collapsed && (
          <div className="mb-4 rounded-lg bg-accent/50 p-3">
            <p className="text-xs font-medium text-muted-foreground">Logged in as</p>
            <p className="truncate text-sm font-bold">Ops Lead</p>
          </div>
        )}
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-foreground transition-colors"
      >
        <ChevronLeft
          className={cn(
            "h-4 w-4 transition-transform",
            collapsed && "rotate-180",
          )}
        />
      </button>
    </aside>
  );
}
