"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Button, 
  Badge 
} from "@modern-essentials/ui";
import { 
  ArrowLeft, 
  Pause,
  Play,
  SkipForward,
  Trash2,
  Settings2,
  Clock
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { PauseDialog } from "@/components/subscriptions/PauseDialog";
import { SkipDialog } from "@/components/subscriptions/SkipDialog";
import { CancelFlow } from "@/components/subscriptions/CancelFlow";
import { FrequencyPicker } from "@/components/subscriptions/FrequencyPicker";
import { QuantityPicker } from "@/components/subscriptions/QuantityPicker";

export default function SubscriptionDetailPage() {
  const { id } = useParams();
  const { isSignedIn, isLoaded, user } = useUser();
  const { getToken } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [_, setError] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // Dialog states
  const [isPauseOpen, setIsPauseOpen] = useState(false);
  const [isSkipOpen, setIsSkipOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isEditingFreq, setIsEditingFreq] = useState(false);
  const [isEditingQty, setIsEditingQty] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchSubscription();
    }
  }, [isLoaded, isSignedIn, id]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError("");
      const token = (await getToken()) || user?.id || "test-user-123";

      const response = await fetch(`${apiUrl}/subscriptions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error("Subscription not found");

      const data = await response.json();
      setSubscription(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, body?: any) => {
    try {
      const token = (await getToken()) || user?.id || "test-user-123";
      const response = await fetch(`${apiUrl}/subscriptions/${id}/${action}`, {
        method: action === "cancel" ? "POST" : "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) throw new Error(`Failed to ${action} subscription`);
      
      const updated = await response.json();
      setSubscription(updated);
      setIsEditingFreq(false);
      setIsEditingQty(false);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-6 text-primary/60 font-medium">Loading subscription...</p>
      </div>
    );
  }

  if (!subscription) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-3xl font-headline font-bold mb-8 text-primary">Subscription not found</h1>
      <Button asChild className="bg-secondary hover:brightness-110 h-14 px-10 rounded-xl font-bold shadow-sm">
        <Link href="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface pb-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <Link href="/dashboard" className="inline-flex items-center text-sm font-bold text-primary/40 hover:text-primary mb-12 transition-colors group tracking-widest uppercase">
          <ArrowLeft className="mr-3 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col lg:flex-row justify-between items-end gap-12 mb-20">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-6">
              <h1 className="text-6xl font-headline font-bold tracking-tight text-primary leading-none">{subscription.productName}</h1>
              <Badge className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-full border-none ${
                subscription.status === "ACTIVE" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
              }`}>
                {subscription.status}
              </Badge>
            </div>
            <p className="text-primary/40 font-bold text-xs uppercase tracking-[0.2em]">Subscription ID: {subscription.id}</p>
          </div>
          
          <div className="flex gap-4 w-full sm:w-auto">
             {subscription.status === "ACTIVE" ? (
                <Button variant="outline" className="flex-1 sm:flex-initial h-14 px-8 border-primary/10 text-primary hover:bg-primary/5 rounded-xl font-bold transition-all shadow-sm active:scale-95" onClick={() => setIsPauseOpen(true)}>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
              ) : (
                <Button variant="outline" className="flex-1 sm:flex-initial h-14 px-8 border-primary/10 text-primary hover:bg-primary/5 rounded-xl font-bold transition-all shadow-sm active:scale-95" onClick={() => handleAction("resume")}>
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </Button>
              )}
              <Button variant="outline" className="flex-1 sm:flex-initial h-14 px-8 border-red-100 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-all shadow-sm active:scale-95" onClick={() => setIsCancelOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Cancel
              </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-16">
            <div className="bg-surface-container-low shadow-[0px_20px_40px_rgba(6,27,14,0.04)] rounded-xl overflow-hidden p-12">
              <h2 className="text-2xl font-headline font-bold flex items-center gap-4 text-primary mb-12">
                <Settings2 className="h-6 w-6 text-secondary" />
                Subscription Settings
              </h2>
              
              <div className="space-y-16">
                {/* Quantity */}
                <div className="group">
                  <div className="flex items-start justify-between">
                    <div className="space-y-4 flex-1">
                      <p className="text-xs font-bold text-primary/40 uppercase tracking-[0.2em]">Quantity per delivery</p>
                      {isEditingQty ? (
                        <div className="pt-4 space-y-6">
                          <QuantityPicker 
                            value={subscription.quantity} 
                            onValueChange={(val) => handleAction("quantity", { quantity: val })}
                            pricePerUnit={subscription.product.subPrice}
                          />
                          <Button variant="ghost" size="sm" onClick={() => setIsEditingQty(false)} className="text-primary/40 hover:text-primary font-bold">Cancel Editing</Button>
                        </div>
                      ) : (
                        <p className="text-4xl font-headline font-bold text-primary">{subscription.quantity} Eggs</p>
                      )}
                    </div>
                    {!isEditingQty && (
                      <Button variant="outline" className="font-bold text-secondary border-secondary/20 hover:bg-secondary/5 rounded-xl px-8 h-12" onClick={() => setIsEditingQty(true)}>Edit</Button>
                    )}
                  </div>
                </div>

                {/* Frequency */}
                <div className="">
                  <div className="flex items-start justify-between">
                    <div className="space-y-4 flex-1">
                      <p className="text-xs font-bold text-primary/40 uppercase tracking-[0.2em]">Delivery Frequency</p>
                      {isEditingFreq ? (
                        <div className="pt-4 space-y-6">
                          <FrequencyPicker 
                            value={subscription.frequency} 
                            onValueChange={(val) => handleAction("frequency", { frequency: val })}
                            basePrice={subscription.product.subPrice * subscription.quantity}
                          />
                          <Button variant="ghost" size="sm" onClick={() => setIsEditingFreq(false)} className="text-primary/40 hover:text-primary font-bold">Cancel Editing</Button>
                        </div>
                      ) : (
                        <p className="text-4xl font-headline font-bold text-primary capitalize">{subscription.frequency.toLowerCase()}</p>
                      )}
                    </div>
                    {!isEditingFreq && (
                      <Button variant="outline" className="font-bold text-secondary border-secondary/20 hover:bg-secondary/5 rounded-xl px-8 h-12" onClick={() => setIsEditingFreq(true)}>Edit</Button>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="">
                  <div className="flex items-start justify-between">
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-primary/40 uppercase tracking-[0.2em]">Delivery Address</p>
                      <div className="pt-2 space-y-2">
                        <p className="font-headline font-bold text-2xl text-primary">{subscription.addressLine1}</p>
                        {subscription.addressLine2 && <p className="text-primary/60 text-lg leading-relaxed">{subscription.addressLine2}</p>}
                        <p className="text-primary/60 text-lg leading-relaxed">{subscription.city}, {subscription.state} - {subscription.postalCode}</p>
                      </div>
                    </div>
                    <Button variant="ghost" className="font-bold text-secondary hover:bg-secondary/5 rounded-xl h-12 px-8">Edit Address</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-12">
            {/* Delivery Card */}
            <div className="bg-primary text-white rounded-xl p-12 shadow-[0px_20px_40px_rgba(6,27,14,0.15)] relative overflow-hidden">
              <div className="relative z-10 space-y-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white/60">
                    <Clock className="h-5 w-5" />
                    <p className="text-xs font-bold uppercase tracking-[0.2em]">Next Delivery</p>
                  </div>
                  <p className="text-5xl font-headline font-bold leading-none">
                    {format(new Date(subscription.nextDeliveryAt), "MMM d")}
                  </p>
                  <p className="text-white/60 text-sm font-medium">
                    Auto-billing on {format(new Date(subscription.nextBillingAt), "MMM d")}.
                  </p>
                </div>
                
                <Button 
                  className="w-full h-14 bg-secondary text-white hover:brightness-110 font-bold rounded-xl border-none shadow-lg transition-all"
                  onClick={() => setIsSkipOpen(true)}
                >
                  <SkipForward className="mr-3 h-5 w-5" />
                  Skip This Delivery
                </Button>
              </div>
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
            </div>

            {/* Savings Widget */}
            <div className="bg-surface-container-low rounded-xl p-12 shadow-[0px_20px_40px_rgba(6,27,14,0.04)] space-y-8">
              <div className="space-y-4">
                <p className="text-xs font-bold text-primary/40 uppercase tracking-[0.2em]">Total Value</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-headline font-bold text-primary">₹{(subscription.price / 100).toFixed(2)}</p>
                  <p className="text-primary/40 font-medium text-sm">/ delivery</p>
                </div>
              </div>
              <div className="bg-primary/5 rounded-xl p-6 border-none">
                <p className="text-base font-medium text-primary leading-relaxed">You save 15% on every delivery compared to one-time buyers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <PauseDialog 
        isOpen={isPauseOpen} 
        onClose={() => setIsPauseOpen(false)} 
        
        onConfirm={(weeks) => handleAction("pause", { durationWeeks: weeks })}
      />

      <SkipDialog 
        isOpen={isSkipOpen} 
        onClose={() => setIsSkipOpen(false)} 
        
        nextDeliveryDate={subscription.nextDeliveryAt}
        onConfirm={() => handleAction("skip")}
      />

      <CancelFlow 
        isOpen={isCancelOpen} 
        onClose={() => setIsCancelOpen(false)} 
        subscription={{
          id: subscription.id,
          productName: subscription.productName
        }}
        onConfirm={(reason) => handleAction("cancel", { reason })}
        onPauseInstead={() => {
          setIsCancelOpen(false);
          setIsPauseOpen(true);
        }}
      />
    </div>
  );
}
