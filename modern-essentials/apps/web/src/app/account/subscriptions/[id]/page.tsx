"use client";

import { useUser } from "@clerk/nextjs";
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
  ChevronRight,
  Pause,
  Play,
  SkipForward,
  Trash2,
  Settings2
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
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      const response = await fetch(`/api/subscriptions/${id}`);
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
      const response = await fetch(`/api/subscriptions/${id}/${action}`, {
        method: action === "cancel" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
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

  if (!isLoaded || loading) return <div className="p-10 text-center">Loading...</div>;
  if (!subscription) return <div className="p-10 text-center text-red-600">Subscription not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link href="/account/subscriptions" className="flex items-center text-sm text-muted-foreground hover:text-teal-600 mb-6 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to All Subscriptions
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{subscription.productName}</h1>
          <p className="text-muted-foreground mt-1">ID: {subscription.id}</p>
        </div>
        <Badge className={`text-sm py-1 px-3 ${
          subscription.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
        }`}>
          {subscription.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Core Info */}
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Settings2 className="mr-2 h-5 w-5 text-teal-600" />
                Subscription Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quantity */}
              <div className="flex items-center justify-between group">
                <div>
                  <p className="text-sm text-muted-foreground">Quantity per delivery</p>
                  {isEditingQty ? (
                    <div className="mt-4">
                      <QuantityPicker 
                        value={subscription.quantity} 
                        onValueChange={(val) => handleAction("quantity", { quantity: val })}
                        pricePerUnit={subscription.product.subPrice}
                      />
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingQty(false)} className="mt-2">Cancel</Button>
                    </div>
                  ) : (
                    <p className="text-xl font-bold">{subscription.quantity} Eggs</p>
                  )}
                </div>
                {!isEditingQty && (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingQty(true)}>Edit</Button>
                )}
              </div>

              <Separator />

              {/* Frequency */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Frequency</p>
                  {isEditingFreq ? (
                    <div className="mt-4">
                      <FrequencyPicker 
                        value={subscription.frequency} 
                        onValueChange={(val) => handleAction("frequency", { frequency: val })}
                        basePrice={subscription.product.subPrice * subscription.quantity}
                      />
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingFreq(false)} className="mt-2">Cancel</Button>
                    </div>
                  ) : (
                    <p className="text-xl font-bold capitalize">{subscription.frequency.toLowerCase()}</p>
                  )}
                </div>
                {!isEditingFreq && (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingFreq(true)}>Edit</Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-teal-600" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-start">
                <div className="text-gray-700">
                  <p className="font-medium">{subscription.addressLine1}</p>
                  {subscription.addressLine2 && <p>{subscription.addressLine2}</p>}
                  <p>{subscription.city}, {subscription.state} - {subscription.postalCode}</p>
                </div>
                <Button variant="ghost" size="sm">Edit Address</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Actions & Summary */}
        <div className="space-y-8">
          <Card className="bg-teal-50 border-teal-100">
            <CardHeader>
              <CardTitle className="text-lg">Next Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-teal-600 mr-3" />
                <p className="font-bold text-lg">
                  {format(new Date(subscription.nextDeliveryAt), "EEE, MMM d")}
                </p>
              </div>
              <p className="text-sm text-teal-700">
                Billing will happen automatically on {format(new Date(subscription.nextBillingAt), "MMM d")}.
              </p>
              <Button 
                variant="outline" 
                className="w-full bg-white border-teal-200 text-teal-700 hover:bg-teal-100"
                onClick={() => setIsSkipOpen(true)}
              >
                <SkipForward className="mr-2 h-4 w-4" />
                Skip This Delivery
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {subscription.status === "ACTIVE" ? (
                <Button variant="outline" className="w-full justify-start text-yellow-700 border-yellow-200 hover:bg-yellow-50" onClick={() => setIsPauseOpen(true)}>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause Subscription
                </Button>
              ) : (
                <Button variant="outline" className="w-full justify-start text-green-700 border-green-200 hover:bg-green-50" onClick={() => handleAction("resume")}>
                  <Play className="mr-2 h-4 w-4" />
                  Resume Subscription
                </Button>
              )}
              
              <Button variant="outline" className="w-full justify-start text-red-600 border-red-100 hover:bg-red-50" onClick={() => setIsCancelOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Cancel Subscription
              </Button>
            </CardContent>
          </Card>
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
