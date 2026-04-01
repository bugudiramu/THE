"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { PrintButton } from "@/components/print-button";
import { apiGet } from "@/lib/api";
import { formatShortDate } from "@/lib/utils";

interface PickListItem {
  orderId: string;
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
      <div className="flex flex-col h-full">
        <Header title="Pick List" />
        <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Pick List" />
        <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
          <div className="text-red-500 text-lg">{error}</div>
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
    <div className="flex flex-col h-full bg-white print:bg-white">
      <Header title="Daily Pick List" />

      <div className="flex-1 p-6 space-y-8 max-w-5xl mx-auto w-full">
        {/* Header section */}
        <div className="flex items-center justify-between border-b pb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Pick List &mdash; FEFO Directed
            </h2>
            <p className="text-gray-500 mt-1">
              Generated: {formatShortDate(data.generatedAt)} at{" "}
              {new Date(data.generatedAt).toLocaleTimeString("en-IN")}
            </p>
          </div>
          <PrintButton />
        </div>

        {/* Warning banner */}
        {data.warnings && data.warnings.length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <h3 className="text-sm font-semibold text-red-800">
              Stock Shortages Detected
            </h3>
            <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
              {data.warnings.map((w, i) => (
                <li key={i}>
                  <span className="font-mono">{w.sku}</span>: Requires{" "}
                  {w.requested}, only {w.available} available
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Grouped Pick List */}
        {Object.keys(itemsBySku).length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-xl">
            <p className="text-gray-500">No pending items to pick today.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(itemsBySku).map(([sku, items]) => (
              <div key={sku} className="rounded-xl border shadow-sm bg-white overflow-hidden break-inside-avoid">
                <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {items[0].productName}
                    </h3>
                    <p className="text-sm font-mono text-gray-500">{sku}</p>
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                    Total Qty: {items.reduce((sum, i) => sum + i.qty, 0)}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white">
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Bin Location
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Batch Expires
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Qty to Pick
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                          Done
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {items.map((item, idx) => (
                        <tr key={`${item.orderId}-${idx}`} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                              {item.binLocation || "UNASSIGNED"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatShortDate(item.expiresAt)}
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-gray-500">
                            {item.orderId.slice(-8)}
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-900">
                            {item.qty}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="h-6 w-6 rounded border-2 border-gray-300 mx-auto print:border-black print:border-2"></div>
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
