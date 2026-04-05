"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@modern-essentials/ui";
import { Badge } from "@modern-essentials/ui";
import { IWastageLog } from "@modern-essentials/types";
import { 
  Trash2, 
  AlertCircle,
  TrendingDown,
} from "lucide-react";

import { apiGet } from "@/lib/api";

export const dynamic = "force-dynamic";

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

  if (loading) return <div className="p-8">Loading Wastage Log...</div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wastage Log</h1>
          <p className="text-muted-foreground">
            Audit trail for broken, expired, or rejected stock.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wastage (All Time)</CardTitle>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalWastage} units</div>
            <p className="text-xs text-muted-foreground">Across all products and reasons.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Wastage %</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2%</div>
            <p className="text-xs text-muted-foreground">Target: &lt; 3.0% (§12.2)</p>
          </CardContent>

        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Reason</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">BREAKAGE</div>
            <p className="text-xs text-muted-foreground">42% of total wastage.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wastage Entries</CardTitle>
          <CardDescription>
            Detailed logs of every stock write-off.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Product</th>
                  <th className="px-4 py-3 text-left font-medium">Qty</th>
                  <th className="px-4 py-3 text-left font-medium">Reason</th>
                  <th className="px-4 py-3 text-left font-medium">Logged By</th>
                  <th className="px-4 py-3 text-left font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium">{new Date(log.loggedAt).toLocaleDateString()}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(log.loggedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{log.productName}</div>
                      <div className="text-xs text-muted-foreground">{log.sku}</div>
                      {log.inventoryBatchId && (
                        <div className="text-[10px] font-mono mt-1">Batch: {log.inventoryBatchId}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-red-600">-{log.qty}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {log.reason}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {log.loggedBy}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground italic">
                      {log.notes || "—"}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No wastage logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
