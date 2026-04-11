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
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-6 text-primary/60 font-medium">Loading your subscriptions...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-center px-4">
        <div className="bg-surface-container-low p-10 rounded-full mb-8 shadow-sm">
          <Package className="h-16 w-16 text-primary/20" />
        </div>
        <h1 className="text-4xl font-headline font-bold text-primary mb-4">Sign in to view subscriptions</h1>
        <p className="text-primary/60 mb-10 max-w-sm text-lg">
          Please sign in to manage your recurring deliveries and subscription settings.
        </p>
        <Button asChild className="bg-secondary hover:brightness-110 h-14 px-10 rounded-xl text-lg font-bold">
          <Link href="/sign-in">Sign In Now</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-16">
          <div>
            <h1 className="text-5xl font-headline font-bold text-primary tracking-tight">My Subscriptions</h1>
            <p className="mt-4 text-primary/60 text-xl max-w-2xl">Manage your recurring deliveries and self-service options.</p>
          </div>
          <Button asChild className="mt-8 md:mt-0 bg-secondary hover:brightness-110 h-14 px-8 rounded-xl font-bold transition-all shadow-sm">
            <Link href="/products">Subscribe to more</Link>
          </Button>
        </div>

        {error && (
          <div className="mb-12 bg-red-50 border-none text-red-700 px-8 py-6 rounded-xl flex items-center shadow-sm">
            <span className="font-bold">Error:</span>
            <span className="ml-3 font-medium">{error}</span>
          </div>
        )}

        {subscriptions.length === 0 ? (
          <div className="bg-surface-container-low rounded-xl py-24 px-8 text-center shadow-[0px_20px_40px_rgba(6,27,14,0.04)] border-none">
            <div className="bg-surface w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Package className="h-10 w-10 text-primary/20" />
            </div>
            <h2 className="text-3xl font-headline font-bold text-primary mb-4">No Active Subscriptions</h2>
            <p className="text-primary/60 mb-12 max-w-md mx-auto text-lg leading-relaxed">
              You don't have any active subscriptions. Subscribe to our fresh
              farm-to-table eggs for regular, hassle-free delivery!
            </p>
            <Button asChild className="bg-secondary hover:brightness-110 h-14 px-10 rounded-xl text-lg font-bold shadow-sm">
              <Link href="/products">Browse Fresh Eggs</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {subscriptions.map((subscription) => (
              <SubscriptionCard key={subscription.id} subscription={subscription} />
            ))}
          </div>
        )}

        <div className="mt-24 bg-primary rounded-xl p-10 md:p-20 text-white overflow-hidden relative shadow-[0px_20px_40px_rgba(6,27,14,0.15)]">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-headline font-bold mb-6">Subscription Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16">
              <div className="bg-white/5 p-8 rounded-xl backdrop-blur-sm">
                <div className="bg-secondary w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-secondary/20">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="font-headline font-bold text-xl mb-3">Up to 15% Savings</h3>
                <p className="text-white/70 leading-relaxed">Always pay less than one-time customers on every delivery.</p>
              </div>
              <div className="bg-white/5 p-8 rounded-xl backdrop-blur-sm">
                <div className="bg-secondary w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-secondary/20">
                  <RefreshCw className="h-6 w-6" />
                </div>
                <h3 className="font-headline font-bold text-xl mb-3">Zero Hassle</h3>
                <p className="text-white/70 leading-relaxed">Automated scheduling and payments so you never run out of eggs.</p>
              </div>
              <div className="bg-white/5 p-8 rounded-xl backdrop-blur-sm">
                <div className="bg-secondary w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-secondary/20">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="font-headline font-bold text-xl mb-3">Flexible Scheduling</h3>
                <p className="text-white/70 leading-relaxed">Pause, skip, or modify anytime. No long-term commitments.</p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-secondary/10 rounded-full blur-[100px]"></div>
        </div>
      </div>
    </div>
  );
}
