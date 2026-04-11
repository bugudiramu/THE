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
  RefreshCw,
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
    label: "Subscriptions",
    href: "/subscriptions",
    icon: RefreshCw,
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
        "relative flex flex-col bg-[#2B7A78] text-[#ffffff] transition-all duration-500 ease-in-out shadow-2xl z-20",
        collapsed ? "w-20" : "w-72",
      )}
    >
      <div className="flex h-24 items-center px-6 py-8">
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3AAFA9] shadow-lg shadow-[#3AAFA9]/20">
            <Egg className="h-6 w-6 text-white" />
          </div>
          {!collapsed && (
            <span className="text-xl font-headline font-bold tracking-tight text-[#ffffff]">
              Modern Ops
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-8 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-300 relative",
                isActive
                  ? "bg-[#17252A] text-[#ffffff] shadow-sm"
                  : "text-[#ffffff]/50 hover:bg-[#17252A]/50 hover:text-[#ffffff]",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110",
                  !collapsed && "mr-4",
                  isActive
                    ? "text-[#3AAFA9]"
                    : "text-[#ffffff]/30 group-hover:text-[#ffffff]/60",
                )}
              />
              {!collapsed && (
                <span className="tracking-wide uppercase text-[10px] font-bold tracking-[0.15em]">
                  {item.label}
                </span>
              )}
              {isActive && !collapsed && (
                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[#3AAFA9]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-[#17252A]/50 bg-[#17252A]/30">
        {!collapsed && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="h-10 w-10 rounded-full bg-[#17252A] flex items-center justify-center text-xs font-bold text-[#ffffff] border border-[#3AAFA9]/20">
                OL
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-bold text-[#ffffff] uppercase tracking-widest">
                  Ops Lead
                </p>
                <p className="truncate text-[10px] text-[#ffffff]/40 font-medium">
                  Central Hub
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-4 top-12 flex h-8 w-8 items-center justify-center rounded-full bg-[#3AAFA9] text-white shadow-xl hover:scale-110 active:scale-95 transition-all z-30"
      >
        <ChevronLeft
          className={cn(
            "h-4 w-4 transition-transform duration-500",
            collapsed && "rotate-180",
          )}
        />
      </button>
    </aside>
  );
}
