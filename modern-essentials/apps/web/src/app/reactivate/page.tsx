"use client";

import { useUser } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { 
  Button, 
  Heading, 
  Text, 
  Card, 
  CardContent, 
  CardHeader, 
  Skeleton, 
  Alert, 
  AlertDescription,
  Badge
} from "@modern-essentials/ui";
import { RefreshCcw, CheckCircle2 } from "lucide-react";

interface Subscription {
  id: string;
  productName: string;
  quantity: number;
  frequency: string;
  price: number;
}

function ReactivateContent() {
  const { isSignedIn, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const subId = searchParams.get("subId");

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [reactivating, setReactivating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push(`/sign-in?redirect_url=/reactivate?subId=${subId}`);
      return;
    }

    if (isLoaded && isSignedIn) {
      if (subId) {
        fetchSubscriptionDetails();
      } else {
        setError("No subscription ID provided.");
        setLoading(false);
      }
    }
  }, [subId, isSignedIn, isLoaded]);

  const fetchSubscriptionDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/subscriptions/${subId}`);
      if (!response.ok) throw new Error("Failed to fetch subscription details");
      const data = await response.json();
      setSubscription(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async () => {
    try {
      setReactivating(true);
      setError("");
      
      const response = await fetch(`/api/subscriptions/${subId}/reactivate`, {
        method: "POST",
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to reactivate");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/account/subscriptions");
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setReactivating(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-xl border-none bg-surface-container-low rounded-[40px] p-12 space-y-8 shadow-sm">
          <Skeleton className="h-12 w-48 mx-auto" />
          <Skeleton className="h-6 w-64 mx-auto" />
          <Skeleton className="h-48 w-full rounded-3xl" />
          <Skeleton className="h-16 w-full rounded-full" />
        </Card>
      </div>
    );
  }

  if (error && !subscription) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full border-none bg-surface-container-low rounded-[40px] p-12 text-center space-y-8 shadow-sm">
          <Heading variant="h2" className="text-destructive">Something went wrong</Heading>
          <Text className="text-primary/60">{error}</Text>
          <Button 
            onClick={() => router.push("/")}
            className="w-full bg-secondary h-16 rounded-full font-bold uppercase tracking-widest shadow-lg"
          >
            Return Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-12 md:py-24 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-xl mx-auto border-none bg-surface-container-low rounded-[40px] overflow-hidden shadow-sm">
        <CardHeader className="pt-16 pb-8 text-center space-y-4">
          <Heading variant="h1" className="text-primary tracking-tighter">Welcome Back!</Heading>
          <Text variant="lead" className="text-primary/60">Reactivate your subscription with one click.</Text>
        </CardHeader>

        <CardContent className="px-12 pb-16 space-y-10">
          {success ? (
            <div className="bg-primary/5 p-10 rounded-[32px] text-center space-y-6 animate-in zoom-in duration-500">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-8 h-8 text-secondary" />
              </div>
              <div className="space-y-2">
                <Heading variant="h3" className="text-primary">Successfully Reactivated!</Heading>
                <Text className="text-primary/60">Your subscription is back in action. Redirecting you shortly...</Text>
              </div>
            </div>
          ) : (
            <>
              <Card className="bg-surface border-none rounded-[32px] p-8 shadow-inner space-y-8">
                <div className="flex items-center gap-3 border-b border-primary/5 pb-4">
                  <RefreshCcw className="w-5 h-5 text-secondary" />
                  <Heading variant="h4" className="text-primary">Previous Plan Details</Heading>
                </div>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <Text variant="xs" className="text-primary/40 font-bold">Product</Text>
                    <Text variant="large" className="text-primary">{subscription?.productName}</Text>
                  </div>
                  <div className="flex justify-between items-center">
                    <Text variant="xs" className="text-primary/40 font-bold">Quantity</Text>
                    <Text variant="large" className="text-primary">{subscription?.quantity} Units</Text>
                  </div>
                  <div className="flex justify-between items-center">
                    <Text variant="xs" className="text-primary/40 font-bold">Frequency</Text>
                    <Badge variant="secondary" className="font-bold uppercase tracking-widest px-3 py-1 border-none">{subscription?.frequency}</Badge>
                  </div>
                </div>
              </Card>

              {error && (
                <Alert variant="destructive" className="rounded-2xl">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-6">
                <Button
                  onClick={handleReactivate}
                  disabled={reactivating}
                  size="lg"
                  className="w-full h-20 bg-secondary hover:brightness-110 text-white rounded-full font-bold uppercase tracking-widest text-sm shadow-xl shadow-secondary/20 transition-all active:scale-[0.98]"
                >
                  {reactivating ? "Processing..." : "Reactivate Now"}
                </Button>
                
                <Text variant="xs" className="text-center text-primary/30 font-bold uppercase max-w-[300px] mx-auto leading-relaxed">
                  By clicking reactivate, a new subscription will be created with your existing details.
                </Text>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReactivatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-surface">
      <Skeleton className="h-12 w-12 rounded-full" />
    </div>}>
      <ReactivateContent />
    </Suspense>
  );
}
