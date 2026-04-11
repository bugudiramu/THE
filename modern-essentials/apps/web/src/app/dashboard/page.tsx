"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

interface Subscription {
  id: string;
  product: {
    name: string;
    price: number;
    subPrice?: number;
  };
  quantity: number;
  frequency: string;
  status: string;
  nextBillingAt: string;
}

interface Order {
  id: string;
  status: string;
  total: number;
  placedAt: string;
  items: Array<{
    product: { name: string };
    qty: number;
  }>;
}

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchDashboardData();
    }
  }, [isLoaded, isSignedIn]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = (await getToken()) || user?.id || "test-user-123";
      
      const [subsRes, ordersRes] = await Promise.all([
        fetch(`${apiUrl}/subscriptions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${apiUrl}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!subsRes.ok || !ordersRes.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const [subsData, ordersData] = await Promise.all([
        subsRes.json(),
        ordersRes.json(),
      ]);

      setSubscriptions(subsData);
      setOrders(ordersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-6">Please sign in to view your dashboard.</p>
        <Link href="/sign-in" className="bg-primary text-white px-6 py-2 rounded-lg">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div>
            <h1 className="text-4xl font-headline font-bold text-primary mb-2">Welcome, {user.firstName || "Customer"}!</h1>
            <p className="text-primary/70 text-lg">Manage your fresh essentials and subscriptions.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-12">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Subscriptions Section */}
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-surface-container-low rounded-xl shadow-[0px_20px_40px_rgba(6,27,14,0.04)] overflow-hidden">
              <div className="px-8 py-6 flex items-center justify-between">
                <h2 className="text-2xl font-headline font-bold text-primary">Your Active Subscriptions</h2>
                <Link href="/products" className="text-secondary text-sm font-bold hover:underline">
                  + Add New
                </Link>
              </div>
              <div className="px-8 pb-8">
                {subscriptions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-primary/60 mb-6">You don't have any active subscriptions.</p>
                    <Link href="/products" className="inline-block bg-secondary text-white px-8 py-3 rounded-xl text-sm font-bold shadow-sm">
                      Explore Products
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {subscriptions.map((sub) => (
                      <Link 
                        key={sub.id} 
                        href={`/account/subscriptions/${sub.id}`}
                        className="flex items-center justify-between p-6 bg-surface rounded-xl hover:bg-surface-container-high transition-colors shadow-sm"
                      >
                        <div>
                          <h3 className="text-lg font-headline font-bold text-primary">{sub.product.name}</h3>
                          <p className="text-sm text-primary/60 capitalize mt-1">
                            {sub.quantity} eggs • {sub.frequency.toLowerCase()}
                          </p>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <div className="text-right">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                              sub.status === "ACTIVE" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                            }`}>
                              {sub.status}
                            </span>
                            <p className="text-xs text-primary/40 mt-2">Next: {formatDate(sub.nextBillingAt)}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-primary/20" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Order History Section */}
            <div className="bg-surface-container-low rounded-xl shadow-[0px_20px_40px_rgba(6,27,14,0.04)] overflow-hidden">
              <div className="px-8 py-6">
                <h2 className="text-2xl font-headline font-bold text-primary">Recent Orders</h2>
              </div>
              <div className="p-0">
                {orders.length === 0 ? (
                  <div className="p-8 text-center py-12">
                    <p className="text-primary/60">No orders yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-primary/5 text-xs font-bold text-primary/60 uppercase tracking-widest">
                        <tr>
                          <th className="px-8 py-4">Order ID</th>
                          <th className="px-8 py-4">Date</th>
                          <th className="px-8 py-4">Status</th>
                          <th className="px-8 py-4">Total</th>
                        </tr>
                      </thead>
                      <tbody className="">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-primary/5 transition-colors">
                            <td className="px-8 py-6 text-sm font-mono text-primary/80">#{order.id.slice(-8)}</td>
                            <td className="px-8 py-6 text-sm text-primary/70">{formatDate(order.placedAt)}</td>
                            <td className="px-8 py-6">
                              <span className="text-xs font-bold uppercase text-primary/80">{order.status}</span>
                            </td>
                            <td className="px-8 py-6 text-sm font-bold text-primary">{formatPrice(order.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <div id="rewards" className="bg-primary text-white rounded-xl p-8 shadow-[0px_20px_40px_rgba(6,27,14,0.15)] scroll-mt-32">
              <h3 className="text-xl font-headline font-bold mb-3">Member Rewards</h3>
              <p className="text-white/80 text-sm mb-6 leading-relaxed">You have earned 250 points this month. Keep it up!</p>
              <div className="bg-white/10 h-2 rounded-full mb-6">
                <div className="bg-white h-full rounded-full" style={{ width: '60%' }}></div>
              </div>
              <button className="w-full bg-secondary text-white py-3 rounded-xl text-sm font-bold hover:brightness-110 transition-all">
                Redeem Points
              </button>
            </div>

            <div className="bg-surface-container-low rounded-xl p-8 shadow-[0px_20px_40px_rgba(6,27,14,0.04)]">
              <h3 className="text-xl font-headline font-bold text-primary mb-4">Support</h3>
              <p className="text-sm text-primary/60 mb-6 leading-relaxed">Need help with your subscription or a recent order?</p>
              <button className="w-full border-2 border-primary/10 text-primary py-3 rounded-xl text-sm font-bold hover:bg-primary/5 transition-all">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
