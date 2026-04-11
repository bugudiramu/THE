"use client";

import { useUser } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

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
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (error && !subscription) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-surface">
        <h1 className="text-3xl font-headline text-destructive mb-4">Error</h1>
        <p className="text-on-surface-variant mb-8">{error}</p>
        <button 
          onClick={() => router.push("/")}
          className="bg-secondary text-white px-8 py-3 rounded-full font-medium transition-transform hover:scale-[1.02]"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-low py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-surface rounded-2xl p-8 md:p-12 shadow-sm">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-headline text-on-surface mb-3">Welcome Back!</h1>
          <p className="text-lg text-on-surface-variant font-body">Reactivate your subscription with one click.</p>
        </div>

        {success ? (
          <div className="bg-primary/5 text-primary px-4 py-8 rounded-xl text-center">
            <h2 className="text-2xl font-headline mb-3">Successfully Reactivated!</h2>
            <p className="font-body">Your subscription is back in action. Redirecting you to your subscriptions...</p>
          </div>
        ) : (
          <>
            <div className="bg-surface-container-low p-6 rounded-xl mb-10">
              <h2 className="text-xl font-headline mb-6 text-on-surface">Previous Subscription:</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-label">Product:</span>
                  <span className="font-medium text-on-surface">{subscription?.productName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-label">Quantity:</span>
                  <span className="font-medium text-on-surface">{subscription?.quantity} units</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-label">Frequency:</span>
                  <span className="font-medium capitalize text-on-surface">{subscription?.frequency?.toLowerCase()}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleReactivate}
              disabled={reactivating}
              className={`w-full py-5 rounded-full text-white font-bold text-lg transition-all transform hover:scale-[1.01] ${
                reactivating ? "bg-secondary/60 cursor-not-allowed" : "bg-secondary hover:shadow-lg active:scale-95"
              }`}
            >
              {reactivating ? "Reactivating..." : "Reactivate Now"}
            </button>
            
            <p className="mt-6 text-center text-sm text-on-surface-variant/80 font-body">
              By clicking reactivate, a new subscription will be created with your existing details.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function ReactivatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ReactivateContent />
    </Suspense>
  );
}
