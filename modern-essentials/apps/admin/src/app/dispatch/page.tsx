"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { formatPrice } from "@/lib/utils";
import { Printer, Truck } from "lucide-react";

interface ManifestOrderItem {
  productName: string;
  sku: string;
  qty: number;
}

interface ManifestOrder {
  orderId: string;
  customerPhone: string;
  customerEmail: string | null;
  items: ManifestOrderItem[];
  total: number;
  type: string;
}

interface ManifestArea {
  postalCode: string;
  orders: ManifestOrder[];
}

interface ManifestResponse {
  generatedAt: string;
  orderCount: number;
  areaCount: number;
  manifests: ManifestArea[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

function handlePrint() {
  window.print();
}

export default function DispatchPage() {
  const [data, setData] = useState<ManifestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [dispatchLoading, setDispatchLoading] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/orders/dispatch-manifest`, {
        headers: { Authorization: "Bearer test-token" },
      });
      const json = (await res.json()) as ManifestResponse;
      setData(json);
    } catch (err) {
      console.error("Failed to fetch manifest:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDispatch = async (orderId: string) => {
    setDispatchLoading(orderId);
    try {
      await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({ status: "DISPATCHED" }),
      });
      await fetchData();
    } catch (err) {
      console.error("Failed to dispatch:", err);
    } finally {
      setDispatchLoading(null);
    }
  };

  const handleBulkDispatch = async () => {
    if (!data) return;
    setDispatchLoading("bulk");
    try {
      for (const area of data.manifests) {
        for (const order of area.orders) {
          await fetch(`${API_URL}/admin/orders/${order.orderId}/status`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token",
            },
            body: JSON.stringify({ status: "DISPATCHED" }),
          });
        }
      }
      await fetchData();
    } catch (err) {
      console.error("Failed to bulk dispatch:", err);
    } finally {
      setDispatchLoading(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 print:bg-white text-gray-900">
      <Header title="Dispatch Manifest" />
      <div className="flex-1 p-6 space-y-6 max-w-5xl mx-auto w-full print-full-width">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Dispatch Manifest
            </h3>
            <p className="text-sm text-muted-foreground">
              {data?.orderCount || 0} packed orders across {data?.areaCount || 0} areas
              {data?.generatedAt &&
                ` · Generated ${new Date(data.generatedAt).toLocaleTimeString("en-IN")}`}
            </p>
          </div>
          <div className="no-print flex items-center gap-3">
            {data && data.manifests && data.manifests.length > 0 && (
              <button
                onClick={handleBulkDispatch}
                disabled={dispatchLoading === "bulk"}
                className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                <Truck className="h-4 w-4" />
                {dispatchLoading === "bulk"
                  ? "Dispatching..."
                  : "Dispatch All"}
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
          </div>
        </div>

        {/* Manifest areas */}
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500">
            Loading manifest...
          </div>
        ) : !data || !data.manifests || data.manifests.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-12 text-center">
            <Truck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              No packed orders awaiting dispatch.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Orders must be in PACKED status to appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {data.manifests.map((area) => (
              <div key={area.postalCode} className="space-y-4 break-inside-avoid">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-gray-200"></div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3">
                    Area: {area.postalCode} ({area.orders.length} orders)
                  </h4>
                  <div className="h-px flex-1 bg-gray-200"></div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden print:border-none print:shadow-none">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          #
                        </th>
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
                          Type
                        </th>
                        <th className="no-print px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {area.orders.map((order, idx) => (
                        <tr
                          key={order.orderId}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-foreground">
                            {order.orderId.slice(-8)}
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-foreground">
                              {order.customerPhone}
                            </p>
                            {order.customerEmail && (
                              <p className="text-xs text-muted-foreground">
                                {order.customerEmail}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {order.items.map((i) => `${i.productName} ×${i.qty}`).join(", ")}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-foreground">
                            {formatPrice(order.total)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                order.type === "SUBSCRIPTION_RENEWAL"
                                  ? "bg-primary/10 text-primary"
                                  : "bg-secondary text-secondary-foreground"
                              }`}
                            >
                              {order.type === "SUBSCRIPTION_RENEWAL"
                                ? "Subscription"
                                : "One-time"}
                            </span>
                          </td>
                          <td className="no-print px-4 py-3">
                            <button
                              onClick={() => handleDispatch(order.orderId)}
                              disabled={dispatchLoading === order.orderId}
                              className="rounded-lg bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-500 hover:bg-orange-500/20 transition-colors disabled:opacity-50"
                            >
                              {dispatchLoading === order.orderId
                                ? "..."
                                : "Dispatch"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Print footer */}
        <div className="hidden print:block mt-8 border-t border-gray-300 pt-4">
          <p className="text-xs text-gray-500">
            Modern Essentials &mdash; Dispatch Manifest &mdash; Printed{" "}
            {new Date().toLocaleDateString("en-IN")}
          </p>
        </div>
      </div>
    </div>
  );
}
