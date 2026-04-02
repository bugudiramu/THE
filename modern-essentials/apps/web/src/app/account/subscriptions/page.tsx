"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { SubscriptionCard } from "@/components/subscriptions/SubscriptionCard";
import { Button } from "@modern-essentials/ui";
import Link from "next/link";
import { Package, CheckCircle2, Calendar, RefreshCw } from "lucide-react";

export default function AccountSubscriptionsPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchSubscriptions();
    }
  }, [isLoaded, isSignedIn]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/subscriptions", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch subscriptions");
      }

      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
    } catch (err) {
      setError((err as Error).message || "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-teal-500"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading your subscriptions...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="bg-gray-100 p-6 rounded-full mb-6">
          <Package className="h-12 w-12 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view subscriptions</h1>
        <p className="text-gray-600 mb-8 max-w-sm">
          Please sign in to manage your recurring deliveries and subscription settings.
        </p>
        <Button asChild className="bg-teal-600 hover:bg-teal-700 h-12 px-8">
          <Link href="/sign-in">Sign In Now</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Subscriptions</h1>
          <p className="mt-2 text-gray-500">Manage your recurring deliveries and self-service options.</p>
        </div>
        <Button asChild variant="outline" className="mt-4 md:mt-0 border-teal-600 text-teal-700 hover:bg-teal-50">
          <Link href="/products">Subscribe to more</Link>
        </Button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <span className="font-medium">Error:</span>
          <span className="ml-2">{error}</span>
        </div>
      )}

      {subscriptions.length === 0 ? (
        <div className="bg-white border rounded-2xl py-16 px-4 text-center shadow-sm">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-10 w-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Active Subscriptions</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            You don't have any active subscriptions. Subscribe to our fresh
            farm-to-table eggs for regular, hassle-free delivery!
          </p>
          <Button asChild className="bg-teal-600 hover:bg-teal-700 h-12 px-8 text-lg">
            <Link href="/products">Browse Fresh Eggs</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {subscriptions.map((subscription) => (
            <SubscriptionCard key={subscription.id} subscription={subscription} />
          ))}
        </div>
      )}

      <div className="mt-16 bg-teal-600 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Subscription Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div>
              <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-1">Up to 15% Savings</h3>
              <p className="text-teal-50 opacity-80 text-sm">Always pay less than one-time customers on every delivery.</p>
            </div>
            <div>
              <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                <RefreshCw className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-1">Zero Hassle</h3>
              <p className="text-teal-50 opacity-80 text-sm">Automated scheduling and payments so you never run out of eggs.</p>
            </div>
            <div>
              <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-1">Flexible Scheduling</h3>
              <p className="text-teal-50 opacity-80 text-sm">Pause, skip, or modify anytime. No long-term commitments.</p>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
