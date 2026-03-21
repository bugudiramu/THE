"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  subPrice?: number;
  description?: string;
  images?: Array<{
    url: string;
    alt?: string;
    sortOrder: number;
  }>;
}

async function getProduct(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch product");
  }

  return res.json();
}

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isSubscription, setIsSubscription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError(null);
        const productData = await getProduct(params.id as string);
        setProduct(productData as Product);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500 text-lg">Product not found.</div>
      </div>
    );
  }

  const currentPrice =
    isSubscription && product.subPrice ? product.subPrice : product.price;
  const savings = product.subPrice ? product.price - product.subPrice : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <a href="/products" className="text-gray-500 hover:text-gray-700">
                Products
              </a>
            </li>
            <li>
              <span className="text-gray-500">/</span>
            </li>
            <li>
              <span className="text-gray-900 font-medium">{product.name}</span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {product.images && product.images.length > 0 && (
              <div className="space-y-2">
                {product.images.map((image) => (
                  <div
                    key={image.url}
                    className="aspect-square overflow-hidden rounded-lg"
                  >
                    <img
                      src={image.url}
                      alt={image.alt || product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>
                <p className="text-lg text-gray-600 mb-2">
                  {product.description}
                </p>
                <div className="text-sm text-gray-500">
                  SKU: {product.sku} | Category:{" "}
                  {product.category.replace("_", " ")}
                </div>
              </div>

              {/* Pricing Section */}
              <div className="bg-gray-100 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Choose Your Plan
                </h2>

                <div className="space-y-4">
                  {/* One-time Purchase */}
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      !isSubscription
                        ? "border-gray-300 bg-white hover:border-gray-400"
                        : "border-blue-500 bg-blue-50 hover:border-blue-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-medium text-gray-900">
                        One-time Purchase
                      </span>
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{(product.price / 100).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Pay once and own it forever
                    </p>
                  </div>

                  {/* Subscription */}
                  {product.subPrice && (
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        isSubscription
                          ? "border-blue-500 bg-blue-50 hover:border-blue-600"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-medium text-gray-900">
                          Subscribe & Save
                        </span>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-green-600">
                            ₹{(product.subPrice / 100).toFixed(2)}
                          </span>
                          <span className="text-sm text-green-500 block">
                            /month
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-green-600 font-medium">
                          Save ₹{(savings / 100).toFixed(2)} every month!
                        </p>
                        <p className="text-xs text-gray-600">
                          Flexible subscription - cancel anytime
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Current Selection Display */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-gray-900">
                      Total:
                    </span>
                    <span className="text-3xl font-bold text-blue-600">
                      ₹{(currentPrice / 100).toFixed(2)}
                      {isSubscription && (
                        <span className="text-lg text-blue-500">/month</span>
                      )}
                    </span>
                  </div>
                  {isSubscription && savings > 0 && (
                    <div className="mt-2 text-sm text-green-600">
                      You're saving ₹{(savings / 100).toFixed(2)} per month!
                    </div>
                  )}
                </div>

                {/* Toggle Button */}
                <div className="mt-4">
                  <button
                    onClick={() => setIsSubscription(!isSubscription)}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 font-medium"
                  >
                    Switch to{" "}
                    {isSubscription ? "One-time Purchase" : "Subscription"}
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button className="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 font-medium text-lg mt-6">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
