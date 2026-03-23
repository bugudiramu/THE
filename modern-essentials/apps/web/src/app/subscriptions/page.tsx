"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

interface Subscription {
  id: string;
  productId: string;
  productName: string;
  product: {
    id: string;
    name: string;
    sku: string;
    price: number;
    subPrice?: number;
    category: string;
  };
  quantity: number;
  frequency: string;
  status: string;
  nextBillingAt: string;
  savings?: number;
}

export default function SubscriptionsPage() {
  const { isSignedIn } = useUser();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    if (!isSignedIn) {
      return;
    }

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

      const data = await response.json() as { subscriptions: Subscription[] };
      setSubscriptions(data.subscriptions || []);
    } catch (err) {
      setError(
        (err as Error).message || "Failed to load subscriptions",
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async (subscriptionId: string) => {
    console.log("Pause subscription:", subscriptionId);
  };

  const handleResume = async (subscriptionId: string) => {
    console.log("Resume subscription:", subscriptionId);
  };

  const handleCancel = async (subscriptionId: string) => {
    console.log("Cancel subscription:", subscriptionId);
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please Sign In
          </h1>
          <p className="text-gray-600">
            You need to sign in to view your subscriptions.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-teal-500"></div>
          <p className="mt-4 text-gray-600">Loading your subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Subscriptions</h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              No Active Subscriptions
            </h2>
            <p className="text-gray-600 mb-8">
              You don't have any active subscriptions. Subscribe to our fresh
              eggs for regular delivery!
            </p>
            <a
              href="/products-fixed"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
            >
              Browse Products
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {subscription.product.name}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        subscription.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : subscription.status === "PAUSED"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {subscription.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Quantity</span>
                      <span className="font-medium">
                        {subscription.quantity} eggs
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Frequency</span>
                      <span className="font-medium capitalize">
                        {subscription.frequency.toLowerCase()}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Price</span>
                      <span className="font-medium">
                        ₹{(subscription.product.price / 100).toFixed(2)}
                      </span>
                    </div>

                    {subscription.savings && subscription.savings > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Savings</span>
                        <span className="font-medium text-green-600">
                          ₹{(subscription.savings / 100).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {subscription.status === "ACTIVE" && (
                      <button
                        onClick={() => handlePause(subscription.id)}
                        className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
                      >
                        Pause
                      </button>
                    )}

                    {subscription.status === "PAUSED" && (
                      <button
                        onClick={() => handleResume(subscription.id)}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                      >
                        Resume
                      </button>
                    )}

                    <button
                      onClick={() => handleCancel(subscription.id)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
