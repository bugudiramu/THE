"use client";

import { useCart } from "@/contexts/CartContext";
import { Button, FreshnessGauge } from "@modern-essentials/ui";
import { Leaf, Minus, Plus, Check } from "lucide-react";
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
      <div className="space-y-6">
        {product.images && product.images.length > 0 ? (
          <div className="space-y-6">
            {product.images.map((image: any) => (
              <div
                key={image.url}
                className="aspect-square overflow-hidden rounded-3xl bg-surface-container-low"
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
          <div className="aspect-square rounded-3xl bg-surface-container-low flex items-center justify-center">
            <span className="text-on-surface-variant text-sm font-body">No Image</span>
          </div>
        )}
      </div>

      {/* Product Info & Action Area */}
      <div className="flex flex-col">
        <div className="mb-6">
          <FreshnessGauge 
            icon={<Leaf />} 
            label="Farm Fresh Direct" 
            className="mb-4"
          />
          
          <h1 className="text-4xl sm:text-5xl font-headline text-on-surface mb-6 leading-tight">
            {product.name}
          </h1>

          <p className="text-lg text-on-surface-variant leading-relaxed mb-8 font-body">
            {product.description ||
              "Farm fresh directly to your doorstep. Perfect for daily consumption, packed with extreme care and zero compromises."}
          </p>
        </div>

        {/* Pricing / Plan Selection */}
        <div className="bg-surface-container-low rounded-3xl p-8 md:p-10">
          <h2 className="text-[10px] uppercase tracking-widest font-bold text-on-surface mb-8">
            Choose Your Plan
          </h2>

          <SubscriptionToggle
            price={product.price}
            subPrice={product.subPrice}
            onSubscriptionChange={handleSubscriptionChange}
          />

          <div className="my-10 h-px bg-on-surface/5" />

          {/* Action Buttons */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest font-bold text-on-surface">
                Quantity
              </span>
              <div className="flex items-center space-x-6 bg-surface rounded-full px-4 py-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high text-on-surface transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-4 text-center font-bold text-on-surface font-body">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high text-on-surface transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <Button
              onClick={handleAddToCart}
              size="lg"
              className="w-full text-xs uppercase tracking-widest font-bold h-16 bg-secondary hover:opacity-90 text-white rounded-full transition-all active:scale-[0.98]"
            >
              {isSubscription ? "Subscribe Now" : "Add to Cart"}
            </Button>

            <p className="text-[10px] uppercase tracking-widest font-bold text-center text-on-surface-variant flex items-center justify-center pt-4 opacity-60">
              <Check className="w-3 h-3 mr-2" />
              No commitments. Cancel or pause anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
