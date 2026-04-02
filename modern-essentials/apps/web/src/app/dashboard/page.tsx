"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
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
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.firstName || "Customer"}!</h1>
            <p className="text-gray-600">Manage your fresh essentials and subscriptions.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Subscriptions Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Your Active Subscriptions</h2>
                <Link href="/products" className="text-primary text-sm font-semibold hover:underline">
                  + Add New
                </Link>
              </div>
              <div className="p-6">
                {subscriptions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You don't have any active subscriptions.</p>
                    <Link href="/products" className="inline-block bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold">
                      Explore Products
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subscriptions.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between p-4 border border-gray-50 rounded-xl hover:bg-gray-50 transition-colors">
                        <div>
                          <h3 className="font-bold text-gray-900">{sub.product.name}</h3>
                          <p className="text-sm text-gray-500 capitalize">
                            {sub.quantity} eggs • {sub.frequency.toLowerCase()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                            sub.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {sub.status}
                          </span>
                          <p className="text-xs text-gray-400 mt-1">Next: {formatDate(sub.nextBillingAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Order History Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              </div>
              <div className="p-0">
                {orders.length === 0 ? (
                  <div className="p-6 text-center py-8">
                    <p className="text-gray-500">No orders yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-3">Order ID</th>
                          <th className="px-6 py-3">Date</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-mono text-gray-900">#{order.id.slice(-8)}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{formatDate(order.placedAt)}</td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-bold uppercase">{order.status}</span>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-gray-900">{formatPrice(order.total)}</td>
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
          <div className="space-y-6">
            <div className="bg-primary text-white rounded-2xl p-6 shadow-lg shadow-primary/20">
              <h3 className="text-lg font-bold mb-2">Member Rewards</h3>
              <p className="text-primary-foreground text-sm mb-4">You have earned 250 points this month. Keep it up!</p>
              <div className="bg-white/20 h-2 rounded-full mb-4">
                <div className="bg-white h-full rounded-full" style={{ width: '60%' }}></div>
              </div>
              <button className="w-full bg-white text-primary py-2 rounded-lg text-sm font-bold">
                Redeem Points
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Support</h3>
              <p className="text-sm text-gray-600 mb-4">Need help with your subscription or a recent order?</p>
              <button className="w-full border border-gray-200 text-gray-900 py-2 rounded-lg text-sm font-bold hover:bg-gray-50">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
