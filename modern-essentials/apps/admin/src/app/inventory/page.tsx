"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { apiGet, apiPost } from "@/lib/api";
import { formatShortDate } from "@/lib/utils";
import { Database, AlertTriangle, Plus, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface InventorySummary {
  id: string;
  sku: string;
  name: string;
  totalQty: number;
  availableQty: number;
  qcPendingQty: number;
  expiringSoon: number;
}

interface Batch {
  id: string;
  productId: string;
  qty: number;
  receivedAt: string;
  expiresAt: string;
  locationId: string | null;
  status: string;
  qcStatus: string;
  product: { name: string; sku: string };
  farmBatch?: { farm: { name: string } };
}

export default function InventoryPage() {
  const [summary, setSummary] = useState<InventorySummary[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [summaryData, batchesData] = await Promise.all([
        apiGet<InventorySummary[]>("admin/inventory/summary"),
        apiGet<Batch[]>("admin/inventory/batches"),
      ]);
      setSummary(summaryData);
      setBatches(batchesData);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Inventory Status" />
      
      <div className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">
        {/* Actions */}
        <div className="flex justify-end gap-3 no-print">
          <Link
            href="/inventory/grn"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Record GRN
          </Link>
          <Link
            href="/qc"
            className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-accent transition-colors"
          >
            <ShieldCheck className="h-4 w-4" />
            QC Log
          </Link>
        </div>

        {/* SKU Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {summary.map((sku) => (
            <div key={sku.id} className="rounded-xl border shadow-sm bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{sku.name}</h3>
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">{sku.sku}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Database className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Available</p>
                  <p className="text-xl font-bold text-gray-900">{sku.availableQty}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">QC Pending</p>
                  <p className="text-xl font-bold text-orange-600">{sku.qcPendingQty}</p>
                </div>
              </div>

              {sku.expiringSoon > 0 && (
                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-red-600 bg-red-50 p-2 rounded-md border border-red-100">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {sku.expiringSoon} batches expiring in &lt; 3 days
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Batch Table */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Active Batches (FEFO Sorted)</h3>
          <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Batch ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Farm</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">QC Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Expires At</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={7} className="p-8 text-center text-gray-500">Loading batches...</td></tr>
                  ) : batches.length === 0 ? (
                    <tr><td colSpan={7} className="p-8 text-center text-gray-500">No active batches found.</td></tr>
                  ) : (
                    batches.map((batch) => (
                      <tr key={batch.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-500 uppercase">{batch.id.slice(-8)}</td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{batch.product.name}</p>
                          <p className="text-[10px] font-mono text-gray-500">{batch.product.sku}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{batch.farmBatch?.farm.name || "N/A"}</td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">{batch.qty}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            batch.qcStatus === 'PASS' ? 'bg-emerald-100 text-emerald-800' :
                            batch.qcStatus === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {batch.qcStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatShortDate(batch.expiresAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Link
                              href={`/qc?batchId=${batch.id}`}
                              className="text-xs font-medium text-primary hover:underline"
                            >
                              QC
                            </Link>
                            <button
                              onClick={() => {
                                const qty = prompt("Enter qty to deduct (wastage):");
                                if (qty) {
                                  const reason = prompt("Enter reason:");
                                  if (reason) {
                                    apiPost(`admin/inventory/batches/${batch.id}/reconcile`, {
                                      qtyLost: parseInt(qty),
                                      reason,
                                    }).then(() => fetchData());
                                  }
                                }
                              }}
                              className="text-xs font-medium text-red-600 hover:underline"
                            >
                              Reconcile
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
