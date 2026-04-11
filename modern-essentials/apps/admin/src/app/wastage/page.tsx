"use client";

import { useEffect, useState } from "react";
import { IWastageLog } from "@modern-essentials/types";
import { 
  Trash2, 
  AlertCircle,
  TrendingDown,
} from "lucide-react";

import { apiGet } from "@/lib/api";

export const dynamic = "force-dynamic";

import { Header } from "@/components/header";

export default function WastagePage() {
  const [logs, setLogs] = useState<IWastageLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const data = await apiGet<IWastageLog[]>("admin/inventory/wastage");
        setLogs(data);
      } catch (error) {
        console.error("Failed to fetch wastage logs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const totalWastage = logs.reduce((sum, log) => sum + log.qty, 0);

  if (loading) return <div className="p-8 font-headline italic">Loading Wastage Log...</div>;

  return (
    <div className="flex flex-col h-full bg-surface">
      <Header title="Wastage Log" />
      
      <div className="flex-1 p-6 space-y-10 max-w-7xl mx-auto w-full">
        {/* Audit Info */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground max-w-2xl">
            Complete audit trail for broken, expired, or rejected stock. 
            Part of the <span className="font-bold text-primary italic">Modern Ops Transparency Initiative</span>.
          </p>
        </div>

        {/* Metrics */}
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl bg-surface-container-low p-6 shadow-inner transition-all hover:bg-surface-container-high group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Total Wastage</h3>
              <Trash2 className="h-5 w-5 text-red-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="font-headline text-4xl font-bold text-red-700">{totalWastage} units</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium tracking-wide">All-time units written off</p>
          </div>
          
          <div className="rounded-2xl bg-surface-container-low p-6 shadow-inner transition-all hover:bg-surface-container-high group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Monthly Wastage %</h3>
              <TrendingDown className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <div className="font-headline text-4xl font-bold text-foreground">1.2%</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium tracking-wide">Target: &lt; 3.0% (§12.2)</p>
          </div>

          <div className="rounded-2xl bg-surface-container-low p-6 shadow-inner transition-all hover:bg-surface-container-high group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Top Reason</h3>
              <AlertCircle className="h-5 w-5 text-secondary group-hover:scale-110 transition-transform" />
            </div>
            <div className="font-headline text-4xl font-bold text-foreground">BREAKAGE</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium tracking-wide">42% of total wastage incidents</p>
          </div>
        </div>

        {/* Detailed Logs */}
        <div className="space-y-6">
          <h3 className="font-headline text-2xl font-bold text-foreground tracking-tight">Audit History</h3>
          <div className="rounded-2xl bg-surface-bright shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0">
                <thead className="bg-surface-container-low/50">
                  <tr>
                    <th className="px-6 py-5 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">Date</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">Product</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">Qty</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">Reason</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">Logged By</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-surface-bright">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-container-low transition-all duration-200 group">
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground">{new Date(log.loggedAt).toLocaleDateString()}</span>
                          <span className="text-[10px] font-black font-mono text-muted-foreground uppercase">
                            {new Date(log.loggedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-sm font-bold text-foreground">{log.productName}</div>
                        <div className="text-[10px] font-black font-mono text-muted-foreground uppercase tracking-wider mt-0.5">{log.sku}</div>
                        {log.inventoryBatchId && (
                          <div className="text-[10px] font-black font-mono text-primary mt-1 uppercase tracking-tighter">Batch: {log.inventoryBatchId.slice(-8)}</div>
                        )}
                      </td>
                      <td className="px-6 py-6 font-black text-red-700">-{log.qty}</td>
                      <td className="px-6 py-6">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-container-high text-[10px] font-black font-mono text-foreground uppercase tracking-widest">
                          {log.reason}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-muted-foreground font-medium text-xs">
                        {log.loggedBy}
                      </td>
                      <td className="px-6 py-6 text-xs text-muted-foreground italic font-medium">
                        {log.notes || "—"}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center text-muted-foreground italic font-medium">
                        No wastage logs found.
                      </td>
                    </tr>
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
