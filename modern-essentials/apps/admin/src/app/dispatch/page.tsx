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
    <div className="flex flex-col h-full bg-surface print:bg-white text-foreground">
      <Header title="Dispatch Manifest" />
      <div className="flex-1 p-6 space-y-12 max-w-5xl mx-auto w-full print-full-width">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 no-print">
          <div>
            <h3 className="font-headline text-3xl font-bold text-foreground">
              Shipment Manifest
            </h3>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              {data?.orderCount || 0} packed orders across {data?.areaCount || 0} areas
              {data?.generatedAt &&
                ` · Generated ${new Date(data.generatedAt).toLocaleTimeString("en-IN")}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {data && data.manifests && data.manifests.length > 0 && (
              <button
                onClick={handleBulkDispatch}
                disabled={dispatchLoading === "bulk"}
                className="flex items-center gap-2 rounded-xl bg-secondary px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:opacity-90 transition-all disabled:opacity-50 shadow-sm"
              >
                <Truck className="h-4 w-4" />
                {dispatchLoading === "bulk"
                  ? "Dispatching..."
                  : "Dispatch All"}
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-primary/90 transition-all shadow-sm"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
          </div>
        </div>

        {/* Manifest areas */}
        {loading ? (
          <div className="rounded-3xl bg-surface-container-low p-20 text-center font-headline italic text-muted-foreground">
            Loading manifest...
          </div>
        ) : !data || !data.manifests || data.manifests.length === 0 ? (
          <div className="rounded-3xl bg-surface-container-low p-20 text-center space-y-4">
            <Truck className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="font-headline text-2xl text-muted-foreground italic">
              No packed orders awaiting dispatch.
            </p>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">
              Orders must be in PACKED status to appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {data.manifests.map((area) => (
              <div key={area.postalCode} className="space-y-8 break-inside-avoid">
                <div className="flex items-center gap-6">
                  <h4 className="font-headline text-2xl font-bold text-primary italic whitespace-nowrap">
                    Area: {area.postalCode} <span className="text-sm font-sans font-medium text-muted-foreground not-italic ml-3">({area.orders.length} orders)</span>
                  </h4>
                  <div className="h-px flex-1 bg-surface-container-high"></div>
                </div>

                <div className="rounded-3xl bg-surface-container-low overflow-hidden print:border-none border-none">
                  <table className="w-full border-separate border-spacing-0">
                    <thead className="bg-surface-container-high/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest w-12">
                          #
                        </th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          Order ID
                        </th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          Customer
                        </th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          Items
                        </th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          Total
                        </th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          Type
                        </th>
                        <th className="no-print px-6 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-surface-container-low/30">
                      {area.orders.map((order, idx) => (
                        <tr
                          key={order.orderId}
                          className="hover:bg-surface-container-high/50 transition-all duration-200 group"
                        >
                          <td className="px-6 py-6 text-[10px] font-black text-muted-foreground opacity-50">
                            {idx + 1}
                          </td>
                          <td className="px-6 py-6 text-sm font-mono font-bold text-foreground">
                            #{order.orderId.slice(-8)}
                          </td>
                          <td className="px-6 py-6">
                            <p className="text-sm font-bold text-foreground">
                              {order.customerPhone}
                            </p>
                            {order.customerEmail && (
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tight mt-1">
                                {order.customerEmail}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-6 text-sm font-medium text-muted-foreground max-w-xs">
                            {order.items.map((i) => `${i.productName} ×${i.qty}`).join(", ")}
                          </td>
                          <td className="px-6 py-6 text-sm font-black text-foreground">
                            {formatPrice(order.total)}
                          </td>
                          <td className="px-6 py-6">
                            <span
                              className={`inline-flex items-center rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm ${
                                order.type === "SUBSCRIPTION_RENEWAL"
                                  ? "bg-primary text-[#ffffff]"
                                  : "bg-surface-container-high text-foreground"
                              }`}
                            >
                              {order.type === "SUBSCRIPTION_RENEWAL"
                                ? "Subscription"
                                : "One-time"}
                            </span>
                          </td>
                          <td className="no-print px-6 py-6">
                            <button
                              onClick={() => handleDispatch(order.orderId)}
                              disabled={dispatchLoading === order.orderId}
                              className="rounded-xl bg-secondary/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-secondary hover:bg-secondary hover:text-[#ffffff] transition-all disabled:opacity-50 active:scale-95 shadow-sm"
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
        <div className="hidden print:block mt-12 border-t border-primary/20 pt-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Modern Essentials &mdash; Shipment Manifest &mdash; Printed{" "}
            {new Date().toLocaleDateString("en-IN")}
          </p>
        </div>
      </div>
    </div>
  );
}
