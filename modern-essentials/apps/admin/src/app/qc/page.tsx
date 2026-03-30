"use client";

import { useState, useEffect, Suspense } from "react";
import { Header } from "@/components/header";
import { apiGet, apiPatch } from "@/lib/api";
import { formatShortDate } from "@/lib/utils";
import { ShieldCheck, Search, Check, X, AlertCircle, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface Batch {
  id: string;
  productId: string;
  qty: number;
  receivedAt: string;
  expiresAt: string;
  status: string;
  qcStatus: string;
  product: { name: string; sku: string };
}

function QcLogContent() {
  const searchParams = useSearchParams();
  const highlightedBatchId = searchParams.get("batchId");

  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState("PENDING");

  const fetchData = async () => {
    try {
      const data = await apiGet<Batch[]>("admin/inventory/batches");
      setBatches(data);
    } catch (err) {
      console.error("Failed to fetch batches:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (batchId: string, status: string) => {
    setUpdating(batchId);
    try {
      await apiPatch(`admin/inventory/batches/${batchId}/qc`, { status });
      await fetchData();
    } catch (err) {
      console.error("Failed to update QC status:", err);
      alert("Failed to update QC status.");
    } finally {
      setUpdating(null);
    }
  };

  const filteredBatches = batches.filter(b => 
    filter === "ALL" ? true : b.qcStatus === filter
  );

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Quality Control (QC) Log" />
      
      <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex bg-white rounded-lg border p-1 shadow-sm">
            {["PENDING", "PASS", "QUARANTINE", "REJECT", "ALL"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  filter === s 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          
          <div className="relative no-print">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search SKU or Batch ID..."
              className="pl-10 pr-4 py-2 rounded-lg border-gray-200 shadow-sm focus:border-primary focus:ring-primary text-sm w-64"
            />
          </div>
        </div>

        {/* Batch Cards */}
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-gray-500 bg-white rounded-xl border">Loading batches...</div>
          ) : filteredBatches.length === 0 ? (
            <div className="p-12 text-center text-gray-500 bg-white rounded-xl border">
              No batches found with status <strong>{filter}</strong>.
            </div>
          ) : (
            filteredBatches.map((batch) => (
              <div 
                key={batch.id} 
                className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
                  highlightedBatchId === batch.id ? "ring-2 ring-primary ring-offset-2" : ""
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between p-5 gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                      batch.qcStatus === 'PASS' ? 'bg-emerald-50' :
                      batch.qcStatus === 'PENDING' ? 'bg-orange-50' :
                      'bg-red-50'
                    }`}>
                      <ShieldCheck className={`h-6 w-6 ${
                        batch.qcStatus === 'PASS' ? 'text-emerald-600' :
                        batch.qcStatus === 'PENDING' ? 'text-orange-600' :
                        'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{batch.product.name}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                        <span className="font-mono uppercase">SKU: {batch.product.sku}</span>
                        <span className="font-mono uppercase text-gray-400">BATCH: {batch.id.slice(-8)}</span>
                        <span>QTY: <strong className="text-gray-900">{batch.qty}</strong></span>
                        <span>EXPIRES: <strong className="text-gray-900">{formatShortDate(batch.expiresAt)}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 no-print">
                    {updating === batch.id ? (
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    ) : (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(batch.id, 'PASS')}
                          disabled={batch.qcStatus === 'PASS'}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 disabled:opacity-30 transition-colors"
                        >
                          <Check className="h-3.5 w-3.5" />
                          PASS
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(batch.id, 'QUARANTINE')}
                          disabled={batch.qcStatus === 'QUARANTINE'}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 disabled:opacity-30 transition-colors"
                        >
                          <AlertCircle className="h-3.5 w-3.5" />
                          QUARANTINE
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(batch.id, 'REJECT')}
                          disabled={batch.qcStatus === 'REJECT'}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 disabled:opacity-30 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                          REJECT
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function QcLogPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-500">Loading QC Log...</div>}>
      <QcLogContent />
    </Suspense>
  );
}
