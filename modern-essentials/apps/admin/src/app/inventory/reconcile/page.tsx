"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@modern-essentials/ui";
import { Button } from "@modern-essentials/ui";
import { Input } from "@modern-essentials/ui";
import { Label } from "@modern-essentials/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@modern-essentials/ui";
import { ClipboardCheck, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { IBatch, IReconciliation, WastageReason } from "@modern-essentials/types";

export const dynamic = "force-dynamic";

export default function ReconcilePage() {
  const router = useRouter();
  const [batches, setBatches] = useState<IBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<IReconciliation>({
    batchId: "",
    physicalQty: 0,
    reason: "OTHER",
    notes: "",
  });

  const selectedBatch = batches.find(b => b.id === formData.batchId);

  useEffect(() => {
    async function fetchBatches() {
      try {
        const res = await fetch("/api/admin/inventory/batches?status=AVAILABLE");
        if (res.ok) setBatches(await res.json());
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
      const res = await fetch("/api/admin/inventory/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/inventory");
        router.refresh();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message || "Failed to reconcile"}`);
      }
    } catch (error) {
      alert("Failed to submit reconciliation");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8">Loading batches...</div>;

  const discrepancy = selectedBatch ? formData.physicalQty - selectedBatch.qty : 0;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/inventory">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Reconciliation</h1>
          <p className="text-muted-foreground">
            Adjust system stock based on physical count.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Physical Count Entry</CardTitle>
            <CardDescription>
              Every adjustment creates a wastage log entry with a mandatory reason.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="batch">Select Batch</Label>
              <Select 
                onValueChange={(val: string | null) => {
                  if (val) setFormData({ ...formData, batchId: val });
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Search batch by ID or Product" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.productName} ({b.qty} units) - {b.id.substring(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedBatch && (
              <div className="p-4 bg-muted rounded-lg space-y-2 border">
                <div className="flex justify-between text-sm">
                  <span>Product:</span>
                  <span className="font-medium">{selectedBatch.productName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Current System Qty:</span>
                  <span className="font-bold">{selectedBatch.qty}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Expiry Date:</span>
                  <span className="font-medium">{new Date(selectedBatch.expiresAt).toLocaleDateString()}</span>
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="physicalQty">Actual Physical Quantity</Label>
              <Input
                id="physicalQty"
                type="number"
                placeholder="Counted units"
                required
                disabled={!formData.batchId}
                value={formData.physicalQty || ""}
                onChange={(e) => setFormData({ ...formData, physicalQty: parseInt(e.target.value) })}
              />
            </div>

            {selectedBatch && discrepancy !== 0 && (
              <div className={`p-3 rounded-md border flex items-center gap-3 text-sm ${
                discrepancy < 0 ? "bg-red-50 border-red-100 text-red-800" : "bg-blue-50 border-blue-100 text-blue-800"
              }`}>
                <AlertCircle className="h-4 w-4" />
                <span>
                  {discrepancy < 0 
                    ? `Shortage of ${Math.abs(discrepancy)} units will be logged as wastage.` 
                    : `Excess of ${discrepancy} units will be added to stock.`
                  }
                </span>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="reason">Adjustment Reason</Label>
              <Select 
                onValueChange={(val: string | null) => {
                  if (val) setFormData({ ...formData, reason: val as WastageReason });
                }}
                required
                disabled={discrepancy === 0}
                defaultValue="OTHER"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BREAKAGE_PACKING">Breakage (Packing)</SelectItem>
                  <SelectItem value="BREAKAGE_TRANSIT">Breakage (Transit)</SelectItem>
                  <SelectItem value="QC_REJECTED">QC Rejected</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="CUSTOMER_RETURN">Customer Return</SelectItem>
                  <SelectItem value="OTHER">Other / Unexplained</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Audit Notes</Label>
              <Input
                id="notes"
                placeholder="Explain the discrepancy..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={submitting || !formData.batchId}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Stock...
                </>
              ) : (
                <>
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Complete Reconciliation
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
