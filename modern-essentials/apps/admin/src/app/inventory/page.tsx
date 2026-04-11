"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { apiGet } from "@/lib/api";
import { formatShortDate } from "@/lib/utils";
import { Database, AlertTriangle, Plus, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface InventorySummary {
  productId: string;
  sku: string;
  name: string;
  totalQty: number;
  availableQty: number;
  qcPendingQty: number;
  expiryAlertsCount: number;
}

interface Batch {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  qty: number;
  receivedAt: string;
  expiresAt: string;
  locationId: string | null;
  status: string;
  qcStatus: string;
  farmName?: string;
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
    <div className="flex flex-col h-full bg-surface">
      <Header title="Inventory Status" />
      
      <div className="flex-1 p-6 space-y-10 max-w-7xl mx-auto w-full">
        {/* Actions */}
        <div className="flex justify-end gap-4 no-print">
          <Link
            href="/inventory/grn"
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Record GRN
          </Link>
          <Link
            href="/qc"
            className="flex items-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-bold text-secondary-foreground hover:opacity-90 transition-all shadow-sm"
          >
            <ShieldCheck className="h-4 w-4" />
            QC Log
          </Link>
        </div>

        {/* SKU Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {summary.map((sku) => (
            <div key={sku.productId} className="rounded-2xl bg-surface-container-low p-6 transition-all hover:bg-surface-container-high group">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-headline font-bold text-xl text-foreground group-hover:text-primary transition-colors">{sku.name}</h3>
                  <p className="text-[10px] font-black font-mono text-muted-foreground uppercase tracking-widest mt-1">{sku.sku}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-surface-container-highest flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Database className="h-6 w-6 text-primary" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-surface-container-high/30 rounded-xl">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Available</p>
                  <p className="font-headline text-2xl font-bold text-foreground">{sku.availableQty}</p>
                </div>
                <div className="p-4 bg-surface-container-high/30 rounded-xl">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">QC Pending</p>
                  <p className="font-headline text-2xl font-bold text-secondary">{sku.qcPendingQty}</p>
                </div>
              </div>

              {sku.expiryAlertsCount > 0 && (
                <div className="mt-6 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-red-700 bg-red-50/50 p-3 rounded-xl">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  {sku.expiryAlertsCount} batches expiring soon
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Batch Table */}
        <div className="space-y-6">
          <h3 className="font-headline text-2xl font-bold text-foreground tracking-tight">Active Batches <span className="text-sm font-sans font-medium text-muted-foreground ml-2">(FEFO Sorted)</span></h3>
          <div className="rounded-2xl bg-surface-container-low overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0">
                <thead className="bg-surface-container-high/50">
                  <tr>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Batch ID</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">SKU</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Farm</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Qty</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">QC Status</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Expires At</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-surface-container-low/30">
                  {loading ? (
                    <tr><td colSpan={7} className="px-6 py-20 text-center text-muted-foreground italic font-medium">Loading batches...</td></tr>
                  ) : batches.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-20 text-center text-muted-foreground italic font-medium">No active batches found.</td></tr>
                  ) : (
                    batches.map((batch) => (
                      <tr key={batch.id} className="hover:bg-surface-container-low transition-all duration-200 group">
                        <td className="px-6 py-6 font-mono text-[10px] font-black text-muted-foreground uppercase">{batch.id.slice(-8)}</td>
                        <td className="px-6 py-6">
                          <p className="text-sm font-bold text-foreground">{batch.productName}</p>
                          <p className="text-[10px] font-black font-mono text-muted-foreground uppercase tracking-wider mt-0.5">{batch.sku}</p>
                        </td>
                        <td className="px-6 py-6 text-sm font-medium text-muted-foreground">{batch.farmName || "—"}</td>
                        <td className="px-6 py-6 text-sm font-black text-foreground">{batch.qty}</td>
                        <td className="px-6 py-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            batch.qcStatus === 'PASSED' ? 'bg-emerald-100 text-emerald-900' :
                            batch.qcStatus === 'PENDING' ? 'bg-orange-100 text-orange-900' :
                            'bg-red-100 text-red-900'
                          }`}>
                            {batch.qcStatus}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-sm font-medium text-muted-foreground">{formatShortDate(batch.expiresAt)}</td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-4">
                            <Link
                              href={`/qc?batchId=${batch.id}`}
                              className="text-xs font-bold text-primary hover:text-primary/70 transition-colors uppercase tracking-widest"
                            >
                              QC
                            </Link>
                            <Link
                              href={`/inventory/reconcile?batchId=${batch.id}`}
                              className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors uppercase tracking-widest"
                            >
                              Reconcile
                            </Link>
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
