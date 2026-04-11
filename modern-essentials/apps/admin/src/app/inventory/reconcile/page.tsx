"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { IBatch, IReconciliation, WastageReason } from "@modern-essentials/types";

import { apiGet, apiPost } from "@/lib/api";

import { Header } from "@/components/header";

export const dynamic = "force-dynamic";

export default function ReconcilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedBatchId = searchParams.get("batchId");

  const [batches, setBatches] = useState<IBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<IReconciliation>({
    batchId: preselectedBatchId || "",
    physicalQty: 0,
    reason: "OTHER",
    notes: "",
  });

  const selectedBatch = batches.find(b => b.id === formData.batchId);

  useEffect(() => {
    async function fetchBatches() {
      try {
        const data = await apiGet<IBatch[]>("admin/inventory/batches?status=AVAILABLE");
        setBatches(data);
      } catch (error) {
        console.error("Failed to fetch batches:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBatches();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    setSubmitting(true);
    try {
      await apiPost("admin/inventory/reconcile", formData);
      router.push("/inventory");
      router.refresh();
    } catch (error) {
      alert("Failed to submit reconciliation");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-headline text-on-surface-variant">Loading batches...</div>;

  const discrepancy = selectedBatch ? formData.physicalQty - selectedBatch.qty : 0;

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Header title="Inventory: Reconciliation" />
      
      <div className="flex-1 p-8 lg:p-12 max-w-4xl mx-auto w-full">
        <Link
          href="/inventory"
          className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface mb-10 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Inventory
        </Link>

        <div className="bg-surface-container-low rounded-[2rem] p-10 lg:p-14">
          <div className="mb-12">
            <h3 className="text-3xl font-headline font-bold text-on-surface">Stock Reconciliation</h3>
            <p className="text-on-surface-variant/70 mt-2 font-body">Adjust system stock based on physical count. Mandatory reason required for discrepancies.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="space-y-10">
              {/* Batch Selection */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">
                  Select Batch
                </label>
                <select 
                  value={formData.batchId}
                  onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                  required
                  className="w-full bg-surface-container-high/50 border-0 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#3AAFA9]/20 transition-all text-on-surface text-lg appearance-none cursor-pointer"
                >
                  <option value="" className="bg-surface text-base">Select batch by ID or Product...</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id} className="bg-surface text-base">
                      {b.productName} ({b.qty} units) — {b.id.substring(0, 8)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedBatch && (
                <div className="p-8 bg-surface-container-high/30 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest mb-1">Product</p>
                    <p className="font-bold text-on-surface">{selectedBatch.productName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest mb-1">System Qty</p>
                    <p className="text-xl font-headline font-bold text-on-surface">{selectedBatch.qty}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest mb-1">Expiry Date</p>
                    <p className="font-bold text-on-surface">{new Date(selectedBatch.expiresAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              {/* Physical Qty */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">
                  Actual Physical Quantity
                </label>
                <input
                  type="number"
                  placeholder="Counted units"
                  required
                  disabled={!formData.batchId}
                  value={formData.physicalQty || ""}
                  onChange={(e) => setFormData({ ...formData, physicalQty: parseInt(e.target.value) })}
                  className="w-full bg-surface-container-high/50 border-0 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#3AAFA9]/20 transition-all text-on-surface text-2xl font-headline disabled:opacity-30"
                />
              </div>

              {selectedBatch && discrepancy !== 0 && (
                <div className={`p-6 rounded-2xl flex items-center gap-4 text-sm font-bold ${
                  discrepancy < 0 
                    ? "bg-red-50 text-red-800" 
                    : "bg-primary-fixed/30 text-on-primary-fixed"
                }`}>
                  <AlertCircle className="h-5 w-5" />
                  <span className="uppercase tracking-wide text-[10px]">
                    {discrepancy < 0 
                      ? `Shortage of ${Math.abs(discrepancy)} units will be logged as wastage.` 
                      : `Excess of ${discrepancy} units will be added to stock.`
                    }
                  </span>
                </div>
              )}

              {/* Reason Selection */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">
                  Adjustment Reason
                </label>
                <select 
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value as WastageReason })}
                  required
                  disabled={discrepancy === 0}
                  defaultValue="OTHER"
                  className="w-full bg-surface-container-high/50 border-0 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#3AAFA9]/20 transition-all text-on-surface text-lg appearance-none cursor-pointer disabled:opacity-30"
                >
                  <option value="BREAKAGE_PACKING" className="bg-surface">Breakage (Packing)</option>
                  <option value="BREAKAGE_TRANSIT" className="bg-surface">Breakage (Transit)</option>
                  <option value="QC_REJECTED" className="bg-surface">QC Rejected</option>
                  <option value="EXPIRED" className="bg-surface">Expired</option>
                  <option value="CUSTOMER_RETURN" className="bg-surface">Customer Return</option>
                  <option value="OTHER" className="bg-surface">Other / Unexplained</option>
                </select>
              </div>

              {/* Audit Notes */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">
                  Audit Notes
                </label>
                <input
                  placeholder="Explain the discrepancy..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-surface-container-high/50 border-0 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#3AAFA9]/20 transition-all text-on-surface text-lg"
                />
              </div>
            </div>

            <div className="pt-8">
              <button 
                className="w-full flex items-center justify-center gap-3 rounded-full bg-[#2B7A78] px-10 py-5 text-sm font-black uppercase tracking-widest text-[#ffffff] hover:bg-[#2B7A78]/90 transition-all disabled:opacity-50"
                type="submit" 
                disabled={submitting || !formData.batchId}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Updating Stock...
                  </>
                ) : (
                  <>
                    <ClipboardCheck className="h-5 w-5" />
                    Complete Reconciliation
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
