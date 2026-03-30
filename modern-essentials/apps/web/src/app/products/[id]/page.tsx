"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import SubscriptionToggle from "../../../components/SubscriptionToggle";
import { useCart } from "../../../contexts/CartContext";
import { Button, Separator } from "@modern-essentials/ui";

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

// Ensure cache bypass on the mock product endpoint
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
  const [isSubscription, setIsSubscription] = useState(true);
  const [frequency, setFrequency] = useState("WEEKLY");
  const [quantity, setQuantity] = useState(1); // 1 Unit
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

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

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await addItem(product, quantity, isSubscription, frequency);
      console.log(`${product.name} added to cart!`);
    } catch (err) {
      console.error("Failed to add to cart");
    }
  };

  const handleSubscriptionChange = (subscribe: boolean, newFrequency: string) => {
    setIsSubscription(subscribe);
    if (newFrequency) setFrequency(newFrequency);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-lg">{error || "Product not found."}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-muted-foreground">
            <li>
              <a href="/products" className="hover:text-foreground transition-colors">
                Products
              </a>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <span className="text-foreground font-medium">{product.name}</span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Product Images Area */}
          <div className="space-y-4">
            {product.images && product.images.length > 0 ? (
              <div className="space-y-4">
                {product.images.map((image) => (
                  <div
                    key={image.url}
                    className="aspect-square overflow-hidden rounded-2xl bg-muted/20 border"
                  >
                    <img
                      src={image.url}
                      alt={image.alt || product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
                <div className="aspect-square rounded-2xl bg-muted/20 border flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">No Image</span>
                </div>
            )}
          </div>

          {/* Product Info & Action Area */}
          <div className="flex flex-col">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
              {product.name}
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              {product.description || "Farm fresh directly to your doorstep. Perfect for daily consumption, packed with extreme care and zero compromises."}
            </p>

            <Separator className="mt-2 mb-8" />

            {/* Pricing / Plan Selection */}
            <div className="bg-muted/10 border border-muted/50 rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-6">
                Choose Your Plan
              </h2>

              <SubscriptionToggle
                price={product.price}
                subPrice={product.subPrice}
                onSubscriptionChange={handleSubscriptionChange}
              />

              <Separator className="my-8" />

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-foreground">Quantity</span>
                    <div className="flex items-center space-x-4 border rounded-lg px-2 py-1">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold text-foreground">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
                      >
                        +
                      </button>
                    </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className="w-full text-base font-bold tracking-wide h-14 text-white"
                >
                  {isSubscription ? "Subscribe Now" : "Add to Cart"}
                </Button>

                <p className="text-xs text-center text-muted-foreground flex items-center justify-center pt-2">
                   <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                   No commitments. Cancel or pause anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
