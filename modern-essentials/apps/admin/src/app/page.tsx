import { Header } from "@/components/header";
import { prisma } from "@/lib/db";
import {
  ClipboardList,
  PackageCheck,
  Truck,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const statusCards = [
  {
    key: "PAID",
    label: "Awaiting Pick",
    icon: ClipboardList,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    key: "PACKED",
    label: "Ready to Dispatch",
    icon: PackageCheck,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    key: "DISPATCHED",
    label: "In Transit",
    icon: Truck,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    key: "DELIVERED",
    label: "Delivered Today",
    icon: CheckCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
];

const exceptionCards = [
  {
    key: "DUNNING",
    label: "In Dunning",
    icon: AlertTriangle,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    key: "PAYMENT_FAILED",
    label: "Payment Failed",
    icon: AlertTriangle,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    key: "CANCELLED",
    label: "Cancelled",
    icon: AlertTriangle,
    color: "text-red-400",
    bg: "bg-red-400/10",
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
    <div className="flex flex-col h-full">
      <Header title="Dashboard" />
      <div className="flex-1 p-6 space-y-6">
        {/* Welcome section */}
        <div>
          <h3 className="text-2xl font-bold text-foreground">
            Good{" "}
            {new Date().getHours() < 12
              ? "morning"
              : new Date().getHours() < 17
                ? "afternoon"
                : "evening"}
            , Ops Team
          </h3>
          <p className="text-muted-foreground mt-1">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            &middot; {data.total} orders today
          </p>
        </div>

        {/* Main status cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusCards.map((card) => (
            <div
              key={card.key}
              className="rounded-xl border shadow-sm bg-white p-5 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                <div
                  className={`h-9 w-9 rounded-lg ${card.bg} flex items-center justify-center`}
                >
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold text-gray-900">
                {data.counts[card.key] || 0}
              </p>
            </div>
          ))}
        </div>

        {/* Exceptions */}
        <div>
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Exceptions
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {exceptionCards.map((card) => (
              <div
                key={card.key}
                className={`rounded-xl border shadow-sm p-5 ${
                  card.key === "DUNNING" 
                    ? "border-orange-200 bg-orange-50" 
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${
                    card.key === "DUNNING" ? "text-orange-600" : "text-red-600"
                  }`}>{card.label}</p>
                  <card.icon className={`h-4 w-4 ${
                    card.key === "DUNNING" ? "text-orange-500" : "text-red-500"
                  }`} />
                </div>
                <p className={`mt-3 text-3xl font-bold ${
                  card.key === "DUNNING" ? "text-orange-600" : "text-red-600"
                }`}>
                  {data.counts[card.key] || 0}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Quick Actions
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/orders"
              className="flex items-center gap-3 rounded-xl border shadow-sm bg-white p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Manage Orders
                </p>
                <p className="text-xs text-gray-500">
                  View & update order statuses
                </p>
              </div>
            </Link>
            <Link
              href="/pick-list"
              className="flex items-center gap-3 rounded-xl border shadow-sm bg-white p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <PackageCheck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Print Pick List
                </p>
                <p className="text-xs text-gray-500">
                  FEFO-sorted batch assignments
                </p>
              </div>
            </Link>
            <Link
              href="/dispatch"
              className="flex items-center gap-3 rounded-xl border shadow-sm bg-white p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <Truck className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Dispatch Manifest
                </p>
                <p className="text-xs text-gray-500">
                  Print route-wise manifests
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
