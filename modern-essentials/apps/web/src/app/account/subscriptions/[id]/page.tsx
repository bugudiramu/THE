"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Button, 
  Badge,
  Heading,
  Text,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Separator,
  Skeleton
} from "@modern-essentials/ui";
import { 
  ArrowLeft, 
  Pause,
  Play,
  SkipForward,
  Trash2,
  Settings2,
  Clock,
  CalendarDays,
  Zap
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { PauseDialog } from "@/components/subscriptions/PauseDialog";
import { SkipDialog } from "@/components/subscriptions/SkipDialog";
import { CancelFlow } from "@/components/subscriptions/CancelFlow";
import { FrequencyPicker } from "@/components/subscriptions/FrequencyPicker";
import { QuantityPicker } from "@/components/subscriptions/QuantityPicker";
export const runtime = "edge";


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
      <div className="min-h-screen bg-surface px-4 py-12 md:py-24">
        <div className="max-w-6xl mx-auto space-y-12">
          <Skeleton className="h-10 w-48" />
          <div className="flex justify-between items-end">
            <div className="space-y-4">
              <Skeleton className="h-16 w-96" />
              <Skeleton className="h-6 w-64" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-14 w-32 rounded-xl" />
              <Skeleton className="h-14 w-32 rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <Skeleton className="lg:col-span-2 h-[600px] rounded-[40px]" />
            <div className="space-y-8">
              <Skeleton className="h-80 rounded-[40px]" />
              <Skeleton className="h-60 rounded-[40px]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!subscription) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full border-none bg-surface-container-low rounded-[40px] p-12 text-center space-y-8 shadow-sm">
        <Heading variant="h2">Subscription not found</Heading>
        <Button asChild className="w-full bg-secondary h-16 rounded-full font-bold uppercase tracking-widest shadow-lg">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface pb-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Button asChild variant="ghost" className="text-primary/40 hover:text-primary mb-8 h-auto py-2 group">
          <Link href="/dashboard">
            <ArrowLeft className="mr-3 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <Text variant="xs" className="font-bold">Back to Dashboard</Text>
          </Link>
        </Button>

        <div className="flex flex-col lg:flex-row justify-between items-end gap-12 mb-12">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-6">
              <Heading variant="h1" className="text-4xl md:text-6xl text-primary leading-none">{subscription.productName}</Heading>
              <Badge variant={subscription.status === "ACTIVE" ? "default" : "secondary"} className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border-none shadow-sm">
                {subscription.status.replace("_", " ")}
              </Badge>
            </div>
            <Text variant="xs" className="text-primary/30 font-bold tracking-[0.3em]">Subscription ID: {subscription.id}</Text>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
             {subscription.status === "ACTIVE" && (
                <Button variant="outline" className="flex-1 sm:flex-initial h-14 px-6 border-primary/10 text-primary hover:bg-primary/5 rounded-2xl font-bold shadow-sm transition-all active:scale-95 text-[10px] uppercase tracking-widest" onClick={() => setIsPauseOpen(true)}>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
              )}
              {subscription.status === "PAUSED" && (
                <Button variant="outline" className="flex-1 sm:flex-initial h-14 px-6 border-primary/10 text-primary hover:bg-primary/5 rounded-2xl font-bold shadow-sm transition-all active:scale-95 text-[10px] uppercase tracking-widest" onClick={() => handleAction("resume")}>
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </Button>
              )}
              {(subscription.status === "RENEWAL_DUE" || subscription.status === "DUNNING") && (
                <Button disabled variant="outline" className="flex-1 sm:flex-initial h-14 px-6 border-amber-100 text-amber-700 opacity-70 rounded-2xl font-bold shadow-sm text-[10px] uppercase tracking-widest">
                  <Clock className="mr-2 h-4 w-4 animate-pulse" />
                  Processing...
                </Button>
              )}
              {subscription.status !== "CANCELLED" && (
                <Button variant="ghost" className="flex-1 sm:flex-initial h-14 px-6 text-destructive hover:bg-destructive/5 rounded-2xl font-bold transition-all active:scale-95 text-[10px] uppercase tracking-widest" onClick={() => setIsCancelOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-12">
            <Card className="bg-surface-container-low border-none shadow-[0px_20px_40px_rgba(6,27,14,0.04)] rounded-[40px] overflow-hidden p-8 md:p-10">
              <CardHeader className="p-0 mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-secondary/5 rounded-xl flex items-center justify-center">
                    <Settings2 className="h-5 w-5 text-secondary" />
                  </div>
                  <CardTitle className="text-2xl font-headline font-bold text-primary">Subscription Settings</CardTitle>
                </div>
              </CardHeader>
              
              <CardContent className="p-0 space-y-12">
                {/* Quantity */}
                <div className="group">
                  <div className="flex items-start justify-between gap-8">
                    <div className="space-y-4 flex-1">
                      <Text variant="xs" className="text-primary/30 font-bold uppercase tracking-[0.2em]">Quantity per delivery</Text>
                      {isEditingQty ? (
                        <div className="pt-2 space-y-6">
                          <QuantityPicker 
                            value={subscription.quantity} 
                            onValueChange={(val) => handleAction("quantity", { quantity: val })}
                            pricePerUnit={subscription.product.subPrice}
                          />
                          <Button variant="ghost" size="sm" onClick={() => setIsEditingQty(false)} className="text-primary/40 hover:text-primary font-bold h-auto py-2">Cancel Editing</Button>
                        </div>
                      ) : (
                        <Heading variant="h2" className="text-4xl text-primary">{subscription.quantity} Units</Heading>
                      )}
                    </div>
                    {!isEditingQty && (
                      <Button variant="outline" className="font-bold text-secondary border-secondary/20 hover:bg-secondary/5 rounded-2xl px-6 h-12 text-[10px] uppercase tracking-widest" onClick={() => setIsEditingQty(true)}>Edit</Button>
                    )}
                  </div>
                </div>

                <Separator className="bg-primary/5" />

                {/* Frequency */}
                <div className="">
                  <div className="flex items-start justify-between gap-8">
                    <div className="space-y-4 flex-1">
                      <Text variant="xs" className="text-primary/30 font-bold uppercase tracking-[0.2em]">Delivery Frequency</Text>
                      {isEditingFreq ? (
                        <div className="pt-2 space-y-6">
                          <FrequencyPicker 
                            value={subscription.frequency} 
                            onValueChange={(val) => handleAction("frequency", { frequency: val })}
                            basePrice={subscription.product.subPrice * subscription.quantity}
                          />
                          <Button variant="ghost" size="sm" onClick={() => setIsEditingFreq(false)} className="text-primary/40 hover:text-primary font-bold h-auto py-2">Cancel Editing</Button>
                        </div>
                      ) : (
                        <Heading variant="h2" className="text-4xl text-primary capitalize">{subscription.frequency.toLowerCase()}</Heading>
                      )}
                    </div>
                    {!isEditingFreq && (
                      <Button variant="outline" className="font-bold text-secondary border-secondary/20 hover:bg-secondary/5 rounded-2xl px-6 h-12 text-[10px] uppercase tracking-widest" onClick={() => setIsEditingFreq(true)}>Edit</Button>
                    )}
                  </div>
                </div>

                <Separator className="bg-primary/5" />

                {/* Address */}
                <div className="">
                  <div className="flex items-start justify-between gap-8">
                    <div className="space-y-4 flex-1">
                      <Text variant="xs" className="text-primary/30 font-bold uppercase tracking-[0.2em]">Delivery Address</Text>
                      <div className="space-y-1">
                        <Heading variant="h3" className="text-2xl text-primary">{subscription.addressLine1}</Heading>
                        {subscription.addressLine2 && <Text variant="lead" className="text-primary/60 text-sm">{subscription.addressLine2}</Text>}
                        <Text variant="lead" className="text-primary/60 text-sm">{subscription.city}, {subscription.state} - {subscription.postalCode}</Text>
                      </div>
                    </div>
                    <Button variant="outline" className="font-bold text-secondary border-secondary/20 hover:bg-secondary/5 rounded-2xl h-12 px-6 text-[10px] uppercase tracking-widest">Edit Address</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            {/* Delivery Card */}
            <Card className="bg-primary text-white border-none rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white/40">
                    <CalendarDays className="h-4 w-4" />
                    <Text variant="xs" className="font-bold uppercase tracking-[0.2em]">Next Delivery</Text>
                  </div>
                  <Heading variant="h1" className="text-5xl text-white leading-none">
                    {format(new Date(subscription.nextDeliveryAt), "MMM d")}
                  </Heading>
                  <Text variant="small" className="text-white/60">
                    Auto-billing on {format(new Date(subscription.nextBillingAt), "MMM d")}.
                  </Text>
                </div>
                
                <Button 
                  className="w-full h-14 bg-secondary text-white hover:brightness-110 font-bold rounded-2xl border-none shadow-xl transition-all active:scale-[0.98] text-[10px] uppercase tracking-widest"
                  onClick={() => setIsSkipOpen(true)}
                >
                  <SkipForward className="mr-3 h-4 w-4" />
                  Skip This Delivery
                </Button>
              </div>
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
            </Card>

            {/* Savings Widget */}
            <Card className="bg-surface-container-low border-none rounded-[40px] p-10 shadow-sm space-y-8">
              <div className="space-y-2">
                <Text variant="xs" className="text-primary/30 font-bold uppercase tracking-[0.2em]">Total Value</Text>
                <div className="flex items-baseline gap-3">
                  <Heading variant="h2" className="text-4xl text-primary">₹{(subscription.price / 100).toFixed(2)}</Heading>
                  <Text variant="small" className="text-primary/40 font-bold">/ delivery</Text>
                </div>
              </div>
              <Card className="bg-primary/5 rounded-3xl border-none p-6 flex items-start gap-4">
                <Zap className="w-5 h-5 text-secondary shrink-0" />
                <Text variant="small" className="text-primary font-medium leading-relaxed text-xs">You save 15% on every delivery compared to one-time buyers.</Text>
              </Card>
            </Card>
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
