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
  sku: string;
  productName: string;
  qty: number;
  receivedAt: string;
  expiresAt: string;
  status: string;
  qcStatus: string;
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

  const handleUpdateStatus = async (batchId: string, qcStatus: string) => {
    setUpdating(batchId);
    try {
      await apiPatch(`admin/inventory/batches/${batchId}/qc`, { qcStatus });
      await fetchData();
    } catch (err) {
      console.error("Failed to update QC status:", err);
    } finally {
      setUpdating(null);
    }
  };

  const filteredBatches = batches.filter(b => 
    filter === "ALL" ? true : b.qcStatus === filter
  );

  return (
    <div className="flex flex-col h-full bg-surface">
      <Header title="Quality Control (QC) Log" />
      
      <div className="flex-1 p-6 space-y-10 max-w-7xl mx-auto w-full">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex bg-surface-container-low rounded-2xl p-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
            {["PENDING", "PASSED", "QUARANTINE", "REJECTED", "ALL"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all whitespace-nowrap ${
                  filter === s 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-container-high/50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          
          <div className="relative no-print w-full sm:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="SEARCH BATCH OR SKU..."
              className="pl-12 pr-6 py-3.5 rounded-2xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary text-[10px] font-black tracking-widest w-full sm:w-72"
            />
          </div>
        </div>

        {/* Batch Cards */}
        <div className="space-y-6">
          {loading ? (
            <div className="p-20 text-center font-headline italic text-muted-foreground bg-surface-container-low rounded-2xl">Loading batches...</div>
          ) : filteredBatches.length === 0 ? (
            <div className="p-20 text-center font-headline italic text-muted-foreground bg-surface-container-low rounded-2xl">
              No batches found with status <span className="text-primary font-bold not-italic">{filter}</span>.
            </div>
          ) : (
            filteredBatches.map((batch) => (
              <div 
                key={batch.id} 
                className={`bg-surface-container-low rounded-2xl overflow-hidden transition-all group ${
                  highlightedBatchId === batch.id ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between p-6 gap-6">
                  <div className="flex items-start gap-6">
                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                      batch.qcStatus === 'PASSED' ? 'bg-emerald-50' :
                      batch.qcStatus === 'PENDING' ? 'bg-orange-50' :
                      'bg-red-50'
                    }`}>
                      <ShieldCheck className={`h-8 w-8 ${
                        batch.qcStatus === 'PASSED' ? 'text-emerald-700' :
                        batch.qcStatus === 'PENDING' ? 'text-orange-700' :
                        'text-red-700'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-2xl text-foreground leading-tight group-hover:text-primary transition-colors">{batch.productName}</h4>
                      <div className="flex flex-wrap gap-x-8 gap-y-2 mt-3 text-[10px] font-black tracking-widest uppercase text-muted-foreground">
                        <span className="font-mono text-[#ffffff] bg-[#2B7A78] px-2 py-0.5 rounded">SKU: {batch.sku}</span>
                        <span className="font-mono">BATCH: {batch.id.slice(-8)}</span>
                        <span>QTY: <strong className="text-foreground">{batch.qty}</strong></span>
                        <span>EXPIRES: <strong className="text-foreground">{formatShortDate(batch.expiresAt)}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 no-print lg:ml-auto">
                    {updating === batch.id ? (
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    ) : (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(batch.id, 'PASSED')}
                          disabled={batch.qcStatus === 'PASSED'}
                          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white text-[10px] font-black tracking-widest hover:bg-emerald-700 disabled:opacity-20 transition-all active:scale-95"
                        >
                          <Check className="h-4 w-4" />
                          PASSED
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(batch.id, 'QUARANTINE')}
                          disabled={batch.qcStatus === 'QUARANTINE'}
                          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 text-white text-[10px] font-black tracking-widest hover:bg-orange-700 disabled:opacity-20 transition-all active:scale-95"
                        >
                          <AlertCircle className="h-4 w-4" />
                          QUARANTINE
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(batch.id, 'REJECTED')}
                          disabled={batch.qcStatus === 'REJECTED'}
                          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white text-[10px] font-black tracking-widest hover:bg-red-700 disabled:opacity-20 transition-all active:scale-95"
                        >
                          <X className="h-4 w-4" />
                          REJECTED
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
