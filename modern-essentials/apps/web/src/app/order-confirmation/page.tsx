"use client";

import { formatDate, formatPrice } from "@/lib/utils";
import {
  Badge,
  Button,
  Card,
  Heading,
  Skeleton,
  Text,
} from "@modern-essentials/ui";
import {
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  ShoppingBag,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

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
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
        <Skeleton className="h-24 w-24 rounded-full mb-8" />
        <Skeleton className="h-12 w-64 mb-4" />
        <Skeleton className="h-6 w-96" />
      </div>
    );
  }

  if (!orderId || !orderDetails) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full border-none bg-surface-container-low rounded-[40px] p-12 text-center space-y-8 shadow-sm">
          <div className="w-24 h-24 bg-surface rounded-full mx-auto flex items-center justify-center shadow-inner">
            <ShoppingBag className="w-10 h-10 text-primary/20" />
          </div>
          <div className="space-y-4">
            <Heading variant="h2">Order Not Found</Heading>
            <Text className="text-primary/60">
              We couldn't retrieve the details for this order. If you believe
              this is an error, please contact support.
            </Text>
          </div>
          <Button
            asChild
            size="lg"
            className="w-full bg-primary rounded-full h-16 font-bold uppercase tracking-widest"
          >
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Success Hero */}
      <div className="pt-16 pb-12">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-secondary/10 border-8 border-surface shadow-xl mb-2 animate-in zoom-in duration-1000">
            <CheckCircle2 className="w-10 h-10 text-secondary" />
          </div>
          <div className="space-y-4">
            <Badge
              variant="secondary"
              className="px-5 py-1.5 bg-secondary text-white rounded-full font-bold uppercase tracking-[0.2em] border-none shadow-sm text-[10px]"
            >
              Order Confirmed
            </Badge>
            <Heading
              variant="h1"
              className="text-5xl md:text-7xl text-primary tracking-tighter leading-tight"
            >
              A Selection Well Made.
            </Heading>
            <Text
              variant="lead"
              className="text-primary/60 max-w-xl mx-auto italic font-headline text-base md:text-lg"
            >
              Thank you for choosing Modern Essentials. Your fresh delivery is
              being curated with radical transparency and care.
            </Text>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Order Summary */}
          <Card className="lg:col-span-7 border-none bg-surface-container-low rounded-[40px] p-8 md:p-10 space-y-10 shadow-sm overflow-hidden relative">
            <div className="flex justify-between items-end border-b border-primary/5 pb-6 relative z-10">
              <div className="space-y-1">
                <Text
                  variant="xs"
                  className="text-primary/30 font-bold uppercase tracking-widest text-[9px]"
                >
                  Order Reference
                </Text>
                <Heading
                  variant="h2"
                  className="text-2xl md:text-3xl text-primary tracking-tighter"
                >
                  #{orderDetails.orderId}
                </Heading>
              </div>
              <Badge className="rounded-xl bg-primary text-white px-5 py-1.5 text-[10px] uppercase tracking-widest font-bold border-none shadow-lg shadow-primary/10">
                {orderDetails.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-1">
                <Text
                  variant="xs"
                  className="text-primary/30 font-bold uppercase tracking-widest text-[9px]"
                >
                  Type
                </Text>
                <Heading variant="h4" className="text-lg text-primary">
                  {orderDetails.type.replace(/_/g, " ")}
                </Heading>
              </div>
              <div className="space-y-1">
                <Text
                  variant="xs"
                  className="text-primary/30 font-bold uppercase tracking-widest text-[9px]"
                >
                  Date
                </Text>
                <Heading variant="h4" className="text-lg text-primary">
                  {formatDate(new Date())}
                </Heading>
              </div>
              <div className="space-y-1">
                <Text
                  variant="xs"
                  className="text-primary/30 font-bold uppercase tracking-widest text-[9px]"
                >
                  Payment Method
                </Text>
                <Heading variant="h4" className="text-lg text-primary">
                  Digital Gateway
                </Heading>
              </div>
              <div className="space-y-1">
                <Text
                  variant="xs"
                  className="text-secondary font-bold uppercase tracking-widest text-[9px]"
                >
                  Total Amount
                </Text>
                <Heading
                  variant="h2"
                  className="text-3xl md:text-4xl text-primary tracking-tighter"
                >
                  {formatPrice(orderDetails.amount)}
                </Heading>
              </div>
            </div>

            {/* Next Steps */}
            <div className="space-y-8 pt-8 border-t border-primary/5 relative z-10">
              <div className="flex items-center gap-4">
                <Truck className="w-5 h-5 text-secondary" />
                <Heading
                  variant="h3"
                  className="text-xl md:text-2xl text-primary tracking-tight"
                >
                  The Journey Ahead
                </Heading>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-surface border-none rounded-3xl p-6 shadow-inner space-y-3">
                  <Heading
                    variant="h1"
                    className="text-secondary text-2xl opacity-20"
                  >
                    01
                  </Heading>
                  <Text
                    variant="small"
                    className="text-primary/60 leading-relaxed font-bold text-xs"
                  >
                    Expect a detailed digital dossier and tracking coordinates
                    via <span className="text-primary">Email & WhatsApp</span>{" "}
                    shortly.
                  </Text>
                </Card>
                <Card className="bg-surface border-none rounded-3xl p-6 shadow-inner space-y-3">
                  <Heading
                    variant="h1"
                    className="text-secondary text-2xl opacity-20"
                  >
                    02
                  </Heading>
                  <Text
                    variant="small"
                    className="text-primary/60 leading-relaxed font-bold text-xs"
                  >
                    Our curation team is preparing your selection for its{" "}
                    <span className="text-primary">early morning passage</span>{" "}
                    tomorrow.
                  </Text>
                </Card>
              </div>
            </div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
          </Card>

          {/* Action Sidebar */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-32">
            <Card className="bg-primary border-none rounded-[40px] p-8 md:p-10 space-y-8 shadow-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                <div className="space-y-3">
                  <Heading
                    variant="h3"
                    className="text-white text-2xl md:text-3xl tracking-tight"
                  >
                    Continue Your Curation
                  </Heading>
                  <Text className="text-white/60 leading-relaxed text-sm">
                    Your journey with Modern Essentials doesn't end here.
                    Explore your personalized dashboard or continue discovering
                    fresh essentials.
                  </Text>
                </div>
                <div className="space-y-3">
                  <Button
                    asChild
                    size="lg"
                    className="w-full h-16 bg-secondary hover:brightness-110 text-white rounded-full font-bold tracking-widest uppercase text-[10px] shadow-xl shadow-secondary/20 transition-all active:scale-[0.98]"
                  >
                    <Link
                      href="/products"
                      className="flex items-center justify-center gap-4"
                    >
                      Discover More
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full h-16 border-white/10 hover:bg-white/5 text-white rounded-full font-bold tracking-widest uppercase text-[10px] transition-all active:scale-[0.98]"
                  >
                    <Link href="/dashboard">View My Orders</Link>
                  </Button>
                </div>
              </div>
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
            </Card>

            <Card className="border-none bg-surface-container-low rounded-[40px] p-8 md:p-10 space-y-4 shadow-sm">
              <Heading
                variant="h4"
                className="text-primary flex items-center gap-3 text-lg"
              >
                <PhoneCall className="w-4 h-4 text-secondary" />
                Need Assistance?
              </Heading>
              <Text
                variant="small"
                className="text-primary/60 leading-relaxed font-medium text-xs"
              >
                Our concierge team is available to ensure your experience is
                seamless.
              </Text>
              <Button
                asChild
                variant="ghost"
                className="text-secondary font-bold uppercase tracking-widest text-[10px] h-auto p-0 hover:bg-transparent hover:text-primary transition-colors"
              >
                <Link href="/support">Contact Concierge</Link>
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
