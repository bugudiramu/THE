"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { 
  Button, 
  Badge,
} from "@modern-essentials/ui";
import { CheckCircle2, Truck, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";

interface OrderDetails {
  orderId: string;
  paymentId: string;
  amount: number;
  status: string;
  type: string;
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      // Simulation of fetching order details
      setOrderDetails({
        orderId: orderId,
        paymentId: "pay_test_" + Math.random().toString(36).substring(7),
        amount: 12000, 
        status: "PAID",
        type: "SUBSCRIPTION_RENEWAL",
      });
    }
    setLoading(false);
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-teal-600 mb-4"></div>
        <p className="text-muted-foreground font-medium animate-pulse">Securing your order details...</p>
      </div>
    );
  }

  if (!orderId || !orderDetails) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Order Not Found</h1>
        <p className="text-muted-foreground mb-8 max-w-sm">
          We couldn't retrieve the details for this order. If you believe this is an error, please contact support.
        </p>
        <Button asChild className="bg-primary text-white px-8 h-12">
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Success Hero - Editorial Celebration */}
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-surface-container-high border-8 border-surface shadow-sm mb-2 animate-in fade-in zoom-in duration-1000">
            <CheckCircle2 className="w-10 h-10 text-[#3AAFA9]" />
          </div>
          <div className="space-y-4">
            <p className="text-[#3AAFA9] font-sans font-bold tracking-[0.3em] text-xs uppercase">Order Confirmed</p>
            <h1 className="text-5xl md:text-7xl font-headline tracking-tight text-foreground leading-tight">
              A Selection Well Made.
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-headline italic">
              Thank you for choosing Modern Essentials. Your fresh delivery is being curated with radical transparency and care.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Order Summary - Tonal Layering */}
          <div className="lg:col-span-7 bg-surface-container-low p-10 md:p-12 space-y-12">
            <div className="flex justify-between items-end border-b border-outline-variant/30 pb-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Order Reference</p>
                <h2 className="text-2xl font-headline text-foreground">#{orderDetails.orderId}</h2>
              </div>
              <Badge variant="outline" className="rounded-none border-outline-variant/40 px-4 py-1 text-[10px] uppercase tracking-[0.2em] font-bold bg-surface">
                {orderDetails.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-sans">Type</p>
                <p className="font-headline text-lg text-foreground">{orderDetails.type.replace(/_/g, " ")}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-sans">Date</p>
                <p className="font-headline text-lg text-foreground">{formatDate(new Date())}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-sans">Payment Method</p>
                <p className="font-headline text-lg text-foreground">Digital Gateway</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-[#3AAFA9] uppercase tracking-widest font-sans">Total Amount</p>
                <p className="text-3xl font-headline text-foreground">{formatPrice(orderDetails.amount)}</p>
              </div>
            </div>

            {/* Next Steps Grid */}
            <div className="space-y-8 pt-6 border-t border-outline-variant/30">
              <h3 className="text-xl font-headline text-foreground flex items-center gap-3">
                <Truck className="w-6 h-6 text-[#3AAFA9]" />
                The Journey Ahead
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 p-6 bg-surface-container-high/50">
                  <span className="font-headline text-[#3AAFA9] text-2xl">01</span>
                  <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                    Expect a detailed digital dossier and tracking coordinates via <span className="text-foreground font-bold">Email & WhatsApp</span> shortly.
                  </p>
                </div>
                <div className="space-y-3 p-6 bg-surface-container-high/50">
                  <span className="font-headline text-[#3AAFA9] text-2xl">02</span>
                  <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                    Our curation team is preparing your selection for its <span className="text-foreground font-bold">early morning passage</span> tomorrow.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="bg-surface-container-highest/30 p-8 space-y-8">
              <h3 className="text-xl font-headline text-foreground">Continue Your Curation</h3>
              <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                Your journey with Modern Essentials doesn't end here. Explore your personalized dashboard or continue discovering fresh essentials.
              </p>
              <div className="space-y-4">
                <Button asChild className="w-full h-16 bg-[#3AAFA9] hover:bg-[#2d8a7c] text-white rounded-none font-sans font-bold tracking-[0.2em] uppercase text-xs transition-all duration-300">
                  <Link href="/products" className="flex items-center justify-center gap-3">
                    Discover More
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full h-16 border-outline-variant/60 hover:bg-surface-container-high rounded-none font-sans font-bold tracking-[0.2em] uppercase text-xs transition-all duration-300">
                  <Link href="/dashboard">
                    View My Orders
                  </Link>
                </Button>
              </div>
            </div>

            <div className="p-8 border border-outline-variant/20 space-y-4">
              <h4 className="text-sm font-headline text-foreground">Need Assistance?</h4>
              <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                Our concierge team is available to ensure your experience is seamless.
              </p>
              <Link href="/support" className="text-[10px] font-bold text-[#3AAFA9] uppercase tracking-widest hover:underline">
                Contact Concierge
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading confirmation...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
