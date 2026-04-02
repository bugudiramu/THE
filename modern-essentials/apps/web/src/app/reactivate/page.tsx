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
        router.push("/subscriptions");
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setReactivating(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error && !subscription) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-600 mb-8">{error}</p>
        <button 
          onClick={() => router.push("/")}
          className="bg-teal-600 text-white px-6 py-2 rounded-md"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
          <p className="mt-2 text-gray-600">Reactivate your subscription with one click.</p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-6 rounded text-center">
            <h2 className="text-xl font-bold mb-2">Successfully Reactivated!</h2>
            <p>Your subscription is back in action. Redirecting you to your subscriptions...</p>
          </div>
        ) : (
          <>
            <div className="border-t border-b border-gray-100 py-6 mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">Previous Subscription:</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Product:</span>
                  <span className="font-medium">{subscription?.productName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Quantity:</span>
                  <span className="font-medium">{subscription?.quantity} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Frequency:</span>
                  <span className="font-medium capitalize">{subscription?.frequency?.toLowerCase()}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              onClick={handleReactivate}
              disabled={reactivating}
              className={`w-full py-4 rounded-lg text-white font-bold text-lg transition-colors ${
                reactivating ? "bg-teal-400 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700"
              }`}
            >
              {reactivating ? "Reactivating..." : "Reactivate Now"}
            </button>
            
            <p className="mt-4 text-center text-sm text-gray-500">
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
