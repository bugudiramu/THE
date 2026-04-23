"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { SubscriptionCard } from "@/components/subscriptions/SubscriptionCard";
import { Button, Heading, Text, Badge, Card, Skeleton } from "@modern-essentials/ui";
import Link from "next/link";
import { Package, CheckCircle2, Calendar, RefreshCw } from "lucide-react";
export const runtime = "edge";


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
      <div className="min-h-screen bg-surface px-4 py-12 md:py-24">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="space-y-4">
            <Skeleton className="h-16 w-96" />
            <Skeleton className="h-6 w-[500px]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <Skeleton className="h-80 w-full rounded-3xl" />
            <Skeleton className="h-80 w-full rounded-3xl" />
            <Skeleton className="h-80 w-full rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full border-none bg-surface-container-low rounded-[40px] p-12 text-center space-y-8 shadow-sm">
          <div className="w-24 h-24 bg-surface rounded-full mx-auto flex items-center justify-center shadow-inner">
            <Package className="w-10 h-10 text-primary/20" />
          </div>
          <div className="space-y-4">
            <Heading variant="h2">Sign in to view subscriptions</Heading>
            <Text className="text-primary/60">
              Please sign in to manage your recurring deliveries and subscription settings.
            </Text>
          </div>
          <Button asChild className="w-full bg-secondary h-16 rounded-full font-bold uppercase tracking-widest shadow-lg">
            <Link href="/sign-in">Sign In Now</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="space-y-1">
            <Heading variant="h1" className="text-3xl md:text-4xl text-primary font-bold">
              My Subscriptions
            </Heading>
            <Text className="text-primary/60 max-w-xl text-sm">
              Manage your recurring deliveries and self-service options.
            </Text>
          </div>
          <Button asChild className="h-10 px-6 rounded-full font-bold bg-secondary hover:brightness-110 shadow-md text-[10px] uppercase tracking-widest">
            <Link href="/products">Subscribe to more</Link>
          </Button>
        </header>

        {error && (
          <Badge variant="destructive" className="w-full py-2 px-4 mb-8 text-xs justify-center rounded-xl font-bold uppercase tracking-widest">
            {error}
          </Badge>
        )}

        {subscriptions.length === 0 ? (
          <Card className="border-none bg-surface-container-low rounded-3xl p-12 text-center space-y-6 shadow-sm overflow-hidden relative">
            <div className="relative z-10 space-y-6">
              <div className="w-20 h-20 bg-surface rounded-full mx-auto flex items-center justify-center shadow-inner">
                <Package className="w-8 h-8 text-primary/20" />
              </div>
              <div className="space-y-2">
                <Heading variant="h2" className="text-2xl text-primary">No Active Subscriptions</Heading>
                <Text className="text-primary/60 max-w-sm mx-auto leading-relaxed text-sm">
                  You don't have any active subscriptions. Subscribe to our fresh
                  farm-to-table eggs for regular delivery!
                </Text>
              </div>
              <Button asChild className="bg-secondary text-white px-8 h-12 rounded-full font-bold uppercase tracking-widest text-[10px] shadow-lg">
                <Link href="/products">Browse Fresh Eggs</Link>
              </Button>
            </div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((subscription) => (
              <SubscriptionCard key={subscription.id} subscription={subscription} />
            ))}
          </div>
        )}

        <Card className="mt-16 bg-primary rounded-[32px] border-none p-8 md:p-12 text-white overflow-hidden relative shadow-xl">
          <div className="relative z-10">
            <Heading variant="h2" className="text-white mb-6 text-2xl md:text-3xl">Subscription Benefits</Heading>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              <div className="bg-white/5 p-6 rounded-2xl backdrop-blur-md border border-white/5 space-y-4">
                <div className="bg-secondary w-10 h-10 rounded-xl flex items-center justify-center shadow-md">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div className="space-y-1">
                  <Heading variant="h4" className="text-white text-lg">Up to 15% Savings</Heading>
                  <Text variant="small" className="text-white/70 text-xs">Always pay less than one-time customers on every delivery.</Text>
                </div>
              </div>
              <div className="bg-white/5 p-6 rounded-2xl backdrop-blur-md border border-white/5 space-y-4">
                <div className="bg-secondary w-10 h-10 rounded-xl flex items-center justify-center shadow-md">
                  <RefreshCw className="h-5 w-5 text-white" />
                </div>
                <div className="space-y-1">
                  <Heading variant="h4" className="text-white text-lg">Zero Hassle</Heading>
                  <Text variant="small" className="text-white/70 text-xs">Automated scheduling and payments so you never run out.</Text>
                </div>
              </div>
              <div className="bg-white/5 p-6 rounded-2xl backdrop-blur-md border border-white/5 space-y-4">
                <div className="bg-secondary w-10 h-10 rounded-xl flex items-center justify-center shadow-md">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div className="space-y-1">
                  <Heading variant="h4" className="text-white text-lg">Flexible Scheduling</Heading>
                  <Text variant="small" className="text-white/70 text-xs">Pause, skip, or modify anytime. No long-term commitments.</Text>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-secondary/10 rounded-full blur-[100px]"></div>
        </Card>
      </div>
    </div>
  );
}
