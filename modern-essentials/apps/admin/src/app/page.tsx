import { Header } from "@/components/header";
import { prisma } from "@/lib/db";
import {
  ClipboardList,
  PackageCheck,
  Truck,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const statusCards = [
  {
    key: "PAID",
    label: "Awaiting Pick",
    icon: ClipboardList,
    color: "text-[#3AAFA9]",
    bg: "bg-[#3AAFA9]/5",
  },
  {
    key: "PACKED",
    label: "Ready to Dispatch",
    icon: PackageCheck,
    color: "text-[#2B7A78]",
    bg: "bg-[#2B7A78]/5",
  },
  {
    key: "DISPATCHED",
    label: "In Transit",
    icon: Truck,
    color: "text-[#3AAFA9]",
    bg: "bg-[#3AAFA9]/5",
  },
  {
    key: "DELIVERED",
    label: "Delivered Today",
    icon: CheckCircle,
    color: "text-[#2B7A78]",
    bg: "bg-[#2B7A78]/5",
  },
];

const exceptionCards = [
  {
    key: "DUNNING",
    label: "In Dunning",
    icon: AlertTriangle,
    color: "text-[#3AAFA9]",
    bg: "bg-surface-container-high",
  },
  {
    key: "PAYMENT_FAILED",
    label: "Payment Failed",
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    key: "CANCELLED",
    label: "Cancelled",
    icon: AlertTriangle,
    color: "text-gray-400",
    bg: "bg-gray-50",
  },
];

async function getDashboardData() {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [orderCounts, dunningCount] = await Promise.all([
      prisma.order.groupBy({
        by: ["status"],
        where: {
          placedAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        _count: {
          status: true,
        },
      }),
      prisma.subscription.count({
        where: {
          status: "DUNNING",
        },
      }),
    ]);

    const statusMap: Record<string, number> = {
      PENDING: 0,
      PAID: 0,
      PICKED: 0,
      PACKED: 0,
      DISPATCHED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
      PAYMENT_FAILED: 0,
      REFUNDED: 0,
      DUNNING: dunningCount,
    };

    orderCounts.forEach((row) => {
      statusMap[row.status] = row._count.status;
    });

    const total = Object.values(statusMap).reduce((sum, v) => sum + v, 0) - dunningCount;

    return { counts: statusMap, total };
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    throw error;
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="flex flex-col h-full bg-[#ffffff]">
      <Header title="Operational Overview" />
      
      <div className="flex-1 p-10 space-y-16 max-w-7xl">
        {/* Welcome section */}
        <div className="space-y-4">
          <p className="text-[#3AAFA9] font-bold tracking-[0.2em] text-xs uppercase">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <div className="flex items-end justify-between">
            <h1 className="text-5xl font-headline font-bold text-[#2B7A78] tracking-tight">
              Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"}, Ops
            </h1>
            <div className="text-right">
              <p className="text-4xl font-headline font-bold text-[#2B7A78]">{data.total}</p>
              <p className="text-[10px] font-bold text-[#3AAFA9] uppercase tracking-widest mt-1">Total Orders Today</p>
            </div>
          </div>
        </div>

        {/* Main status cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {statusCards.map((card) => (
            <div
              key={card.key}
              className="group bg-surface-container-low p-8 transition-all duration-500 hover:translate-y-[-4px] shadow-[0px_20px_40px_rgba(6,27,14,0.02)] hover:shadow-[0px_30px_60px_rgba(6,27,14,0.05)] border-none rounded-none relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#2B7A78]/2 rounded-full group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 space-y-6">
                <div className={`h-12 w-12 rounded-xl ${card.bg} flex items-center justify-center shadow-sm`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div className="space-y-1">
                  <p className="text-5xl font-headline font-bold text-[#2B7A78]">
                    {data.counts[card.key] || 0}
                  </p>
                  <p className="text-[10px] font-bold text-[#3AAFA9] uppercase tracking-[0.15em]">
                    {card.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Exceptions & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Exceptions List */}
          <div className="lg:col-span-2 space-y-8">
            <h4 className="text-xs font-bold text-[#2B7A78]/40 uppercase tracking-[0.3em] pl-1">
              Active Exceptions
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {exceptionCards.map((card) => (
                <div
                  key={card.key}
                  className={`p-6 bg-surface-container-low transition-all duration-300 border-l-4 ${
                    card.key === "DUNNING" ? "border-[#3AAFA9]" : card.key === "PAYMENT_FAILED" ? "border-red-400" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                    <p className="text-2xl font-headline font-bold text-[#2B7A78]">
                      {data.counts[card.key] || 0}
                    </p>
                  </div>
                  <p className="text-[10px] font-bold text-[#2B7A78]/60 uppercase tracking-widest">
                    {card.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-8">
            <h4 className="text-xs font-bold text-[#2B7A78]/40 uppercase tracking-[0.3em]">
              Primary Missions
            </h4>
            <div className="space-y-4">
              {[
                { label: "Manage Orders", href: "/orders", desc: "View & update statuses", color: "bg-[#2B7A78]" },
                { label: "Daily Pick List", href: "/pick-list", desc: "FEFO assignments", color: "bg-[#3AAFA9]" },
                { label: "Dispatch Manifest", href: "/dispatch", desc: "Route-wise lists", color: "bg-[#2B7A78]" },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center justify-between p-6 bg-surface-container-low hover:bg-surface-container-high transition-all duration-300 group"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#2B7A78] uppercase tracking-wider">{action.label}</p>
                    <p className="text-[10px] text-[#2B7A78]/40 font-medium">{action.desc}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-[#3AAFA9] transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
