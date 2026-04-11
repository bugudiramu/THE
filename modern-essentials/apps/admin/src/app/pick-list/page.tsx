"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { PrintButton } from "@/components/print-button";
import { apiGet } from "@/lib/api";
import { formatShortDate } from "@/lib/utils";

interface PickListItem {
  orderId: string;
  orderType: string;
  sku: string;
  productName: string;
  qty: number;
  inventoryBatchId: string;
  binLocation: string;
  expiresAt: string;
}

interface PickListResponse {
  generatedAt: string;
  items: PickListItem[];
  warnings: Array<{ sku: string; requested: number; available: number }>;
}

export default function PickListPage() {
  const [data, setData] = useState<PickListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const fetchedData = await apiGet<PickListResponse>("admin/orders/pick-list");
        setData(fetchedData);
      } catch (err) {
        console.error("Failed to load pick list:", err);
        setError(err instanceof Error ? err.message : "Failed to load pick list data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-surface">
        <Header title="Pick List" />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-surface">
        <Header title="Pick List" />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-red-500 font-headline text-xl italic">{error}</div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Group items by SKU to optimize picking path
  const itemsBySku = data.items.reduce(
    (acc, item) => {
      if (!acc[item.sku]) acc[item.sku] = [];
      acc[item.sku].push(item);
      return acc;
    },
    {} as Record<string, PickListItem[]>,
  );

  return (
    <div className="flex flex-col h-full bg-surface print:bg-white">
      <Header title="Daily Pick List" />

      <div className="flex-1 p-6 space-y-10 max-w-5xl mx-auto w-full">
        {/* Header section */}
        <div className="flex items-center justify-between pb-8 no-print">
          <div>
            <h2 className="font-headline text-3xl font-bold text-foreground">
              Pick List &mdash; FEFO Directed
            </h2>
            <p className="text-muted-foreground mt-2 font-medium">
              Generated: <span className="text-foreground font-bold">{formatShortDate(data.generatedAt)}</span> at{" "}
              <span className="text-foreground font-bold">{new Date(data.generatedAt).toLocaleTimeString("en-IN")}</span>
            </p>
          </div>
          <PrintButton />
        </div>

        {/* Warning banner */}
        {data.warnings && data.warnings.length > 0 && (
          <div className="rounded-2xl bg-red-50/50 p-6 no-print">
            <h3 className="text-[10px] font-black text-red-800 uppercase tracking-widest flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              Stock Shortages Detected
            </h3>
            <ul className="mt-4 text-[10px] text-red-700 font-bold uppercase tracking-wider space-y-2">
              {data.warnings.map((w, i) => (
                <li key={i} className="flex justify-between max-w-md">
                  <span className="font-mono text-red-900">SKU: {w.sku}</span>
                  <span>REQ: {w.requested} | AVAIL: {w.available}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Grouped Pick List */}
        {Object.keys(itemsBySku).length === 0 ? (
          <div className="text-center py-20 bg-surface-container-low rounded-3xl italic font-headline text-muted-foreground">
            <p>No pending items to pick today.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(itemsBySku).map(([sku, items]) => (
              <div key={sku} className="rounded-3xl bg-surface-container-low overflow-hidden break-inside-avoid border-none">
                <div className="px-8 py-6 flex items-center justify-between bg-surface-container-high/30">
                  <div>
                    <h3 className="font-headline font-bold text-2xl text-foreground">
                      {items[0].productName}
                    </h3>
                    <p className="text-[10px] font-black font-mono text-muted-foreground uppercase tracking-widest mt-1">SKU: {sku}</p>
                  </div>
                  <div className="bg-[#2B7A78] px-5 py-2 rounded-xl text-[#ffffff] text-[10px] font-black uppercase tracking-widest shadow-sm">
                    Total Qty: {items.reduce((sum, i) => sum + i.qty, 0)}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-separate border-spacing-0">
                    <thead className="bg-surface-container-high/50">
                      <tr>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          Bin Location
                        </th>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          Batch Expires
                        </th>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          Order ID
                        </th>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          Qty to Pick
                        </th>
                        <th className="px-8 py-4 text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest w-24">
                          Done
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-surface-container-low/30">
                      {items.map((item, idx) => (
                        <tr key={`${item.orderId}-${idx}`} className="hover:bg-surface-container-high/50 transition-all duration-200 group">
                          <td className="px-8 py-6">
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-surface-container-highest text-foreground">
                              {item.binLocation || "UNASSIGNED"}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-sm font-bold text-muted-foreground">
                            {formatShortDate(item.expiresAt)}
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-sm font-mono font-bold text-foreground">#{item.orderId.slice(-8)}</p>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1 italic">{item.orderType === "SUBSCRIPTION_RENEWAL" ? "SUBSCRIPTION" : "ONE-TIME"}</p>
                          </td>
                          <td className="px-8 py-6 text-lg font-black text-foreground">
                            {item.qty}
                          </td>
                          <td className="px-8 py-6 text-center">
                            <div className="h-8 w-8 rounded-xl border-2 border-primary/20 bg-surface-container-lowest mx-auto print:border-black print:border-2 transition-colors group-hover:border-primary"></div>
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
      </div>
    </div>
  );
}
