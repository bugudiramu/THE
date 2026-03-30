"use client";

import { useCart } from "@/contexts/CartContext";
import { Button, Separator } from "@modern-essentials/ui";
import { useState } from "react";
import SubscriptionToggle from "./SubscriptionToggle";

interface ProductDetailClientProps {
  product: any;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [isSubscription, setIsSubscription] = useState(true);
  const [frequency, setFrequency] = useState("WEEKLY");
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const handleAddToCart = async () => {
    try {
      await addItem(product, quantity, isSubscription, frequency);
    } catch (err) {
      console.error("Failed to add to cart", err);
    }
  };

  const handleSubscriptionChange = (
    subscribe: boolean,
    newFrequency: string,
  ) => {
    setIsSubscription(subscribe);
    if (newFrequency) setFrequency(newFrequency);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
      {/* Product Images Area */}
      <div className="space-y-4">
        {product.images && product.images.length > 0 ? (
          <div className="space-y-4">
            {product.images.map((image: any) => (
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
          {product.description ||
            "Farm fresh directly to your doorstep. Perfect for daily consumption, packed with extreme care and zero compromises."}
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
              <span className="text-sm font-semibold text-foreground">
                Quantity
              </span>
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
              <svg
                className="w-4 h-4 mr-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              No commitments. Cancel or pause anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
