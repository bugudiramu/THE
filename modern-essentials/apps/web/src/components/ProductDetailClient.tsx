"use client";

import { useCart } from "@/contexts/CartContext";
import { 
  Button, 
  FreshnessGauge, 
  Heading, 
  Text, 
  AspectRatio, 
  Card, 
  Separator 
} from "@modern-essentials/ui";
import { Leaf, Minus, Plus, Check } from "lucide-react";
import { useState } from "react";
import SubscriptionToggle from "./SubscriptionToggle";
import Image from "next/image";

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
      {/* Product Images Area - 5 cols */}
      <div className="lg:col-span-5 space-y-4">
        {product.images && product.images.length > 0 ? (
          <div className="space-y-4">
            {product.images.map((image: any) => (
              <AspectRatio key={image.url} ratio={1.1} className="overflow-hidden rounded-2xl bg-surface-container-low shadow-sm border border-primary/5">
                <Image
                  src={image.url}
                  alt={image.alt || product.name}
                  fill
                  priority
                  className="object-cover"
                />
              </AspectRatio>
            ))}
          </div>
        ) : (
          <AspectRatio ratio={1} className="rounded-2xl bg-surface-container-low flex items-center justify-center border border-dashed border-primary/10">
            <Text variant="muted">No Image Available</Text>
          </AspectRatio>
        )}
      </div>

      {/* Product Info & Action Area - 7 cols */}
      <div className="lg:col-span-7 flex flex-col gap-5 lg:sticky lg:top-24">
        <div className="space-y-3">
          <FreshnessGauge 
            icon={<Leaf className="w-3 h-3" />} 
            label="Farm Fresh Direct" 
          />
          
          <Heading variant="h1" className="text-2xl sm:text-3xl text-primary leading-tight font-bold">
            {product.name}
          </Heading>

          <Text className="text-primary/60 leading-relaxed font-medium text-sm max-w-2xl">
            {product.description ||
              "Farm fresh directly to your doorstep. Perfect for daily consumption, packed with care and zero compromises."}
          </Text>
        </div>

        {/* Pricing / Plan Selection */}
        <Card className="bg-surface-container-low border-none rounded-2xl p-4 md:p-5 shadow-sm ring-1 ring-primary/5">
          <div className="mb-4">
            <Text variant="xs" className="text-primary/30 font-black uppercase tracking-[0.1em]">
              Select Your Plan
            </Text>
          </div>

          <SubscriptionToggle
            price={product.price}
            subPrice={product.subPrice}
            onSubscriptionChange={handleSubscriptionChange}
          />

          <Separator className="my-5 bg-primary/5" />

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Text variant="xs" className="text-primary/40 font-bold uppercase tracking-widest">
                Curated Quantity
              </Text>
              <div className="flex items-center space-x-4 bg-surface rounded-full px-3 py-1.5 shadow-inner border border-primary/5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-surface-container-high text-primary transition-colors p-0"
                >
                  <Minus className="w-3.5 h-3.5" />
                </Button>
                <Text className="w-4 text-center font-bold text-sm text-primary">
                  {quantity}
                </Text>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-surface-container-high text-primary transition-colors p-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <Button
              onClick={handleAddToCart}
              size="lg"
              className="w-full text-xs uppercase tracking-[0.15em] font-black h-12 bg-secondary hover:brightness-110 text-white rounded-full transition-all active:scale-[0.98] shadow-md shadow-secondary/10"
            >
              {isSubscription ? "Start Subscription" : "Add to Cart"}
            </Button>

            <div className="flex items-center justify-center gap-2">
              <Check className="w-3 h-3 text-secondary" />
              <Text variant="xs" className="text-primary/30 font-bold uppercase tracking-widest text-[8px]">
                Flexible schedule. Cancel anytime.
              </Text>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
