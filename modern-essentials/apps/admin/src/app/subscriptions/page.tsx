"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "@/lib/api";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  Label,
} from "@modern-essentials/ui";
import { 
  Search, 
  Filter, 
  User, 
  Package, 
  RefreshCw, 
  Calendar,
  Pause as PauseIcon,
  Play,
  XCircle,
  Edit2,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";

import { Header } from "@/components/header";

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Override dialog state
  const [overrideData, setOverrideData] = useState<{
    isOpen: boolean;
    subId: string;
    action: string;
    reason: string;
    productName: string;
  }>({
    isOpen: false,
    subId: "",
    action: "",
    reason: "",
    productName: "",
  });

  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const query = statusFilter !== "ALL" ? `?status=${statusFilter}` : "";
      const data = await apiGet<any>(`admin/subscriptions${query}`);
      setSubscriptions(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOverrideSubmit = async () => {
    if (!overrideData.reason) {
      alert("Please provide a reason.");
      return;
    }

    try {
      setLoading(true);
      await apiPatch(`admin/subscriptions/${overrideData.subId}/override`, { 
        action: overrideData.action, 
        reason: overrideData.reason 
      });
      setOverrideData({ ...overrideData, isOpen: false, reason: "" });
      fetchSubscriptions();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const openOverrideDialog = (sub: any, action: string) => {
    setOverrideData({
      isOpen: true,
      subId: sub.id,
      action,
      reason: "",
      productName: sub.productName,
    });
  };

  const filteredSubscriptions = subscriptions.filter(sub => 
    sub.user.phone.includes(search) || 
    sub.id.toLowerCase().includes(search.toLowerCase()) ||
    sub.productName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Header title="Subscriptions: Overrides" />
      
      <div className="flex-1 p-8 lg:p-12 space-y-10">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-headline font-bold text-on-surface">Subscription Control</h1>
            <p className="text-on-surface-variant/70 mt-2 font-body">Administrative overrides and management dashboard.</p>
          </div>
          <div className="bg-primary-fixed/30 text-on-primary-fixed px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest">
            Total Subscriptions: {total}
          </div>
        </div>

        <div className="bg-surface-container-low rounded-[2rem] overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/50" />
                <input 
                  placeholder="SEARCH BY USER PHONE, SUB ID, OR PRODUCT..." 
                  className="w-full bg-surface-container-high/50 border-0 rounded-full py-3.5 pl-12 pr-6 text-[10px] font-black tracking-widest uppercase focus:ring-2 focus:ring-[#3AAFA9]/20 outline-none transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-3 bg-surface-container-high/50 rounded-full px-5 py-2">
                  <Filter className="h-4 w-4 text-on-surface-variant/50" />
                  <select 
                    className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest focus:ring-0 outline-none cursor-pointer"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="PAUSED">Paused</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="DUNNING">Dunning</option>
                  </select>
                </div>
                <button 
                  onClick={fetchSubscriptions}
                  className="p-3 bg-surface-container-high/50 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-4">
            {loading && subscriptions.length === 0 ? (
              <div className="py-32 text-center font-headline italic text-on-surface-variant/60">Loading subscriptions...</div>
            ) : filteredSubscriptions.length === 0 ? (
              <div className="py-32 text-center font-headline italic text-on-surface-variant/60">No subscriptions found matching your criteria.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em]">
                    <tr>
                      <th className="px-6 py-4">Subscription & Product</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Schedule</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Next Event</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscriptions.map((sub) => (
                      <tr key={sub.id} className="group hover:bg-surface-container-high/50 transition-all duration-300">
                        <td className="px-6 py-5 first:rounded-l-2xl">
                          <div className="flex items-center">
                            <div className="bg-[#2B7A78] p-3 rounded-xl mr-4 text-[#ffffff]">
                              <Package className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-headline font-bold text-on-surface">{sub.productName}</p>
                              <p className="text-[10px] text-on-surface-variant/50 font-mono mt-0.5 tracking-tight uppercase">#{sub.id.slice(-12)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-on-surface-variant/40 mr-3" />
                            <div>
                              <p className="text-sm font-bold text-on-surface">{sub.user.phone}</p>
                              <p className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-tighter">{sub.user.email || "No email provided"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm">
                            <p className="font-bold text-on-surface">{sub.quantity} units</p>
                            <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-widest mt-0.5 font-black">{sub.frequency.toLowerCase()}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            sub.status === "ACTIVE" ? "bg-primary-fixed text-on-primary-fixed" : 
                            sub.status === "PAUSED" ? "bg-secondary-fixed text-on-secondary-fixed" : 
                            "bg-surface-container-highest text-on-surface-variant"
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-on-surface-variant/80">
                            <Calendar className="h-3.5 w-3.5 mr-2 opacity-50" />
                            {format(new Date(sub.nextDeliveryAt), "MMM d, yyyy")}
                          </div>
                        </td>
                        <td className="px-6 py-5 last:rounded-r-2xl text-right">
                          <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {sub.status === "ACTIVE" ? (
                              <button 
                                className="p-2.5 text-secondary-fixed-dim hover:bg-secondary-fixed/10 rounded-full transition-colors"
                                onClick={() => openOverrideDialog(sub, "PAUSE")}
                                title="Pause"
                              >
                                <PauseIcon className="h-4 w-4" />
                              </button>
                            ) : sub.status === "PAUSED" ? (
                              <button 
                                className="p-2.5 text-primary-fixed-dim hover:bg-primary-fixed/10 rounded-full transition-colors"
                                onClick={() => openOverrideDialog(sub, "RESUME")}
                                title="Resume"
                              >
                                <Play className="h-4 w-4" />
                              </button>
                            ) : null}
                            
                            <button 
                              className="p-2.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                              onClick={() => openOverrideDialog(sub, "CANCEL")}
                              title="Cancel"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>

                            <button 
                              className="p-2.5 text-on-surface-variant/40 hover:bg-surface-container-highest rounded-full transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Override Dialog */}
      <Dialog open={overrideData.isOpen} onOpenChange={(open) => setOverrideData({ ...overrideData, isOpen: open })}>
        <DialogContent className="sm:max-w-[480px] rounded-[2rem] border-0 bg-surface p-0 overflow-hidden">
          <div className="bg-[#3AAFA9]/5 p-8 pb-4">
            <div className="bg-secondary-fixed/30 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <AlertTriangle className="h-7 w-7 text-on-secondary-fixed" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-headline font-bold text-on-surface">
                {overrideData.action === "PAUSE" ? "Pause Subscription" : 
                 overrideData.action === "RESUME" ? "Resume Subscription" : 
                 "Cancel Subscription"}
              </DialogTitle>
              <DialogDescription className="text-on-surface-variant/70 text-sm mt-2 font-body">
                Confirm administrative override for <strong className="text-on-surface">{overrideData.productName}</strong>. 
                This will directly affect the customer's delivery schedule.
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-8 space-y-8">
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Reason for {overrideData.action.toLowerCase()}ing</Label>
              <input
                id="reason"
                placeholder="e.g. Requested by customer via WhatsApp"
                value={overrideData.reason}
                onChange={(e) => setOverrideData({ ...overrideData, reason: e.target.value })}
                className="w-full bg-surface-container-high/50 border-0 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#3AAFA9]/20 transition-all text-on-surface"
              />
            </div>

            <DialogFooter className="gap-3 sm:gap-3 flex-row justify-end">
              <button 
                className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors"
                onClick={() => setOverrideData({ ...overrideData, isOpen: false })} 
                disabled={loading}
              >
                Discard
              </button>
              <button 
                className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-[#ffffff] transition-all shadow-md ${
                  overrideData.action === "CANCEL" ? "bg-red-600 hover:bg-red-700" : 
                  overrideData.action === "PAUSE" ? "bg-[#3AAFA9] hover:bg-[#3AAFA9]/90" :
                  "bg-[#2B7A78] hover:bg-[#2B7A78]/90"
                }`}
                onClick={handleOverrideSubmit}
                disabled={loading || !overrideData.reason}
              >
                {loading ? "Processing..." : `Confirm ${overrideData.action}`}
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
