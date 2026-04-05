"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Button, 
  Badge, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Separator
} from "@modern-essentials/ui";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  RefreshCw, 
  Pause,
  Play,
  SkipForward,
  Trash2,
  Settings2,
  Package,
  Clock
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { PauseDialog } from "@/components/subscriptions/PauseDialog";
import { SkipDialog } from "@/components/subscriptions/SkipDialog";
import { CancelFlow } from "@/components/subscriptions/CancelFlow";
import { FrequencyPicker } from "@/components/subscriptions/FrequencyPicker";
import { QuantityPicker } from "@/components/subscriptions/QuantityPicker";
import { formatPrice } from "@/lib/utils";

export default function SubscriptionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isSignedIn, isLoaded, user } = useUser();
  const { getToken } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-teal-500"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading subscription...</p>
      </div>
    );
  }

  if (!subscription) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-2xl font-bold mb-4">Subscription not found</h1>
      <Button asChild>
        <Link href="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/10 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <Link href="/dashboard" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary mb-8 transition-colors group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black tracking-tight text-foreground">{subscription.productName}</h1>
              <Badge className={`px-3 py-1 text-xs font-bold uppercase tracking-widest ${
                subscription.status === "ACTIVE" ? "bg-teal-100 text-teal-700 border-teal-200" : "bg-orange-100 text-orange-700 border-orange-200"
              }`}>
                {subscription.status}
              </Badge>
            </div>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">Subscription ID: {subscription.id}</p>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
             {subscription.status === "ACTIVE" ? (
                <Button variant="outline" className="flex-1 sm:flex-initial h-12 px-6 border-orange-200 text-orange-700 hover:bg-orange-600 hover:text-white rounded-2xl font-black transition-all shadow-sm active:scale-95" onClick={() => setIsPauseOpen(true)}>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
              ) : (
                <Button variant="outline" className="flex-1 sm:flex-initial h-12 px-6 border-teal-200 text-teal-700 hover:bg-teal-600 hover:text-white rounded-2xl font-black transition-all shadow-sm active:scale-95" onClick={() => handleAction("resume")}>
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </Button>
              )}
              <Button variant="outline" className="flex-1 sm:flex-initial h-12 px-6 border-destructive/20 text-destructive hover:bg-destructive hover:text-white rounded-2xl font-black transition-all shadow-sm active:scale-95" onClick={() => setIsCancelOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Cancel
              </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-white border-b py-6">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-teal-600" />
                  Subscription Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-muted/50">
                  {/* Quantity */}
                  <div className="p-8 group">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Quantity per delivery</p>
                        {isEditingQty ? (
                          <div className="mt-6 space-y-4">
                            <QuantityPicker 
                              value={subscription.quantity} 
                              onValueChange={(val) => handleAction("quantity", { quantity: val })}
                              pricePerUnit={subscription.product.subPrice}
                            />
                            <Button variant="outline" size="sm" onClick={() => setIsEditingQty(false)} className="text-muted-foreground hover:text-foreground border-dashed">Cancel Editing</Button>
                          </div>
                        ) : (
                          <p className="text-2xl font-black text-foreground">{subscription.quantity} Eggs</p>
                        )}
                      </div>
                      {!isEditingQty && (
                        <Button variant="outline" className="font-bold text-teal-600 border-teal-100 hover:bg-teal-50 hover:border-teal-200 rounded-xl px-6" onClick={() => setIsEditingQty(true)}>Edit</Button>
                      )}
                    </div>
                  </div>

                  {/* Frequency */}
                  <div className="p-8">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Delivery Frequency</p>
                        {isEditingFreq ? (
                          <div className="mt-6 space-y-4">
                            <FrequencyPicker 
                              value={subscription.frequency} 
                              onValueChange={(val) => handleAction("frequency", { frequency: val })}
                              basePrice={subscription.product.subPrice * subscription.quantity}
                            />
                            <Button variant="outline" size="sm" onClick={() => setIsEditingFreq(false)} className="text-muted-foreground hover:text-foreground border-dashed">Cancel Editing</Button>
                          </div>
                        ) : (
                          <p className="text-2xl font-black text-foreground capitalize">{subscription.frequency.toLowerCase()}</p>
                        )}
                      </div>
                      {!isEditingFreq && (
                        <Button variant="outline" className="font-bold text-teal-600 border-teal-100 hover:bg-teal-50 hover:border-teal-200 rounded-xl px-6" onClick={() => setIsEditingFreq(true)}>Edit</Button>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="p-8">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Delivery Address</p>
                        <div className="pt-2">
                          <p className="font-bold text-lg text-foreground">{subscription.addressLine1}</p>
                          {subscription.addressLine2 && <p className="text-muted-foreground">{subscription.addressLine2}</p>}
                          <p className="text-muted-foreground">{subscription.city}, {subscription.state} - {subscription.postalCode}</p>
                        </div>
                      </div>
                      <Button variant="ghost" className="font-bold text-teal-600 hover:bg-teal-50 rounded-xl">Edit Address</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            {/* Delivery Card */}
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-teal-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2 opacity-90">
                  <Clock className="h-5 w-5" />
                  Next Delivery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="space-y-1">
                  <p className="text-4xl font-black leading-none">
                    {format(new Date(subscription.nextDeliveryAt), "EEE, MMM d")}
                  </p>
                  <p className="text-teal-50/80 text-sm font-medium">
                    Auto-billing on {format(new Date(subscription.nextBillingAt), "MMM d")}.
                  </p>
                </div>
                
                <Button 
                  className="w-full h-12 bg-white text-teal-700 hover:bg-teal-50 font-bold rounded-xl border-none shadow-lg"
                  onClick={() => setIsSkipOpen(true)}
                >
                  <SkipForward className="mr-2 h-4 w-4" />
                  Skip This Delivery
                </Button>
              </CardContent>
            </Card>

            {/* Savings Widget */}
            <Card className="border-none shadow-xl rounded-3xl bg-white p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-teal-50 p-3 rounded-2xl border border-teal-100">
                  <RefreshCw className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Value</p>
                  <p className="text-2xl font-black text-foreground">₹{(subscription.price / 100).toFixed(2)}</p>
                </div>
              </div>
              <div className="bg-teal-50/50 rounded-2xl p-4 border border-teal-100/50">
                <p className="text-sm font-bold text-teal-800">You save 15% on every delivery compared to one-time buyers.</p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <PauseDialog 
        isOpen={isPauseOpen} 
        onClose={() => setIsPauseOpen(false)} 
        subscriptionId={subscription.id}
        onConfirm={(weeks) => handleAction("pause", { durationWeeks: weeks })}
      />

      <SkipDialog 
        isOpen={isSkipOpen} 
        onClose={() => setIsSkipOpen(false)} 
        subscriptionId={subscription.id}
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
