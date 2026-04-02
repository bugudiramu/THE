"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "@/lib/api";
import { 
  Button, 
  Badge, 
  Card, 
  CardContent, 
  CardHeader, 
  Input,
} from "@modern-essentials/ui";
import { 
  Search, 
  Filter, 
  User, 
  Package, 
  RefreshCw, 
  Calendar,
  Pause,
  Play,
  XCircle,
  Edit2
} from "lucide-react";
import { format } from "date-fns";

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

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

  const handleOverride = async (id: string, action: string, reason: string) => {
    try {
      await apiPatch(`admin/subscriptions/${id}/override`, { action, reason });
      fetchSubscriptions();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => 
    sub.user.phone.includes(search) || 
    sub.id.toLowerCase().includes(search.toLowerCase()) ||
    sub.productName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscription Overrides</h1>
          <p className="text-muted-foreground mt-1">Manage all customer subscriptions and perform administrative overrides.</p>
        </div>
        <div className="bg-teal-50 text-teal-700 px-4 py-2 rounded-lg border border-teal-100 font-semibold">
          Total Subscriptions: {total}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search by User Phone, Sub ID, or Product..." 
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 bg-gray-50 border rounded-md px-3">
                <Filter className="h-4 w-4 text-gray-400" />
                <select 
                  className="bg-transparent border-none text-sm focus:ring-0 outline-none"
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
              <Button onClick={fetchSubscriptions} variant="outline" size="icon">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-20 text-center text-gray-500">Loading subscriptions...</div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="py-20 text-center text-gray-500">No subscriptions found matching your criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Subscription & Product</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Schedule</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Next Event</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSubscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="bg-teal-100 p-2 rounded-lg mr-3 text-teal-700">
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{sub.productName}</p>
                            <p className="text-xs text-gray-500 font-mono">#{sub.id.slice(-8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm font-medium">{sub.user.phone}</p>
                            <p className="text-xs text-gray-500">{sub.user.email || "No Email"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-semibold">{sub.quantity} units</p>
                          <p className="text-xs text-gray-500 capitalize">{sub.frequency.toLowerCase()}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`text-[10px] ${
                          sub.status === "ACTIVE" ? "bg-green-100 text-green-700" : 
                          sub.status === "PAUSED" ? "bg-yellow-100 text-yellow-700" : 
                          "bg-red-100 text-red-700"
                        }`}>
                          {sub.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-xs text-gray-600">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(sub.nextDeliveryAt), "MMM d, yyyy")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {sub.status === "ACTIVE" ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                              onClick={() => {
                                const reason = window.prompt("Reason for pausing:");
                                if (reason) handleOverride(sub.id, "PAUSE", reason);
                              }}
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          ) : sub.status === "PAUSED" ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => {
                                const reason = window.prompt("Reason for resuming:");
                                if (reason) handleOverride(sub.id, "RESUME", reason);
                              }}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          ) : null}
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              const reason = window.prompt("Reason for cancellation:");
                              if (reason) handleOverride(sub.id, "CANCEL", reason);
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>

                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
