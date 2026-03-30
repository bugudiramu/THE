"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { StatusBadge } from "@/components/orders/status-badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { apiGet, apiPatch } from "@/lib/api";

interface OrderItem {
  id: string;
  qty: number;
  price: number;
  total: number;
  product: { id: string; name: string; sku: string };
}

interface Order {
  id: string;
  status: string;
  type: string;
  total: number;
  placedAt: string;
  user: { id: string; phone: string; email: string | null };
  items: OrderItem[];
}

interface StatusCounts {
  counts: Record<string, number>;
  total: number;
}

const STATUS_FILTERS = [
  "ALL",
  "PENDING",
  "PAID",
  "PICKED",
  "PACKED",
  "DISPATCHED",
  "DELIVERED",
  "CANCELLED",
  "PAYMENT_FAILED",
];

const NEXT_STATUS: Record<string, string> = {
  PAID: "PICKED",
  PICKED: "PACKED",
  PACKED: "DISPATCHED",
  DISPATCHED: "DELIVERED",
};

const ACTION_LABELS: Record<string, string> = {
  PICKED: "Mark Picked",
  PACKED: "Mark Packed",
  DISPATCHED: "Mark Dispatched",
  DELIVERED: "Mark Delivered",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [counts, setCounts] = useState<StatusCounts | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const statusParam = filter !== "ALL" ? `?status=${filter}` : "";
      const [ordersData, countsData] = await Promise.all([
        apiGet<Order[]>(`admin/orders/today${statusParam}`),
        apiGet<StatusCounts>("admin/orders/status-counts"),
      ]);
      setOrders(ordersData);
      setCounts(countsData);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [filter]);

  const handleStatusTransition = async (orderId: string, newStatus: string) => {
    setActionLoading(orderId);
    try {
      await apiPatch(`admin/orders/${orderId}/status`, { status: newStatus });
      await fetchData();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Today's Orders" />
      <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {s.replace(/_/g, " ")}
              {counts && s !== "ALL" && (
                <span className="ml-1.5 opacity-70">
                  ({counts.counts[s] || 0})
                </span>
              )}
              {counts && s === "ALL" && (
                <span className="ml-1.5 opacity-70">({counts.total})</span>
              )}
            </button>
          ))}
        </div>

        {/* Orders table */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Placed At
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      Loading orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      No orders found for today
                      {filter !== "ALL" ? ` with status "${filter}"` : ""}.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const nextStatus = NEXT_STATUS[order.status];
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-mono text-foreground">
                          {order.id.slice(-8)}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-foreground">
                            {order.user.phone}
                          </p>
                          {order.user.email && (
                            <p className="text-xs text-muted-foreground">
                              {order.user.email}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {order.items
                            .map((i) => `${i.product.name} ×${i.qty}`)
                            .join(", ")}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">
                          {formatPrice(order.total)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {formatDate(order.placedAt)}
                        </td>
                        <td className="px-4 py-3">
                          {nextStatus && (
                            <button
                              onClick={() =>
                                handleStatusTransition(order.id, nextStatus)
                              }
                              disabled={actionLoading === order.id}
                              className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === order.id
                                ? "..."
                                : ACTION_LABELS[nextStatus]}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
