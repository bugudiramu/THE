"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Badge,
  Separator 
} from "@modern-essentials/ui";
import { CheckCircle2, Package, Truck, Calendar, ArrowRight, ShoppingBag } from "lucide-react";
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
    <div className="min-h-screen bg-muted/10 pb-24">
      {/* Success Hero */}
      <div className="bg-white border-b pt-16 pb-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-50 border-4 border-white shadow-sm mb-6 animate-in zoom-in duration-500">
            <CheckCircle2 className="w-10 h-10 text-teal-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">
            Order Confirmed!
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Thank you for choosing Modern Essentials. Your fresh delivery is now being prepared with radical transparency.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Order Summary Card */}
          <Card className="shadow-xl border-none overflow-hidden">
            <CardHeader className="bg-primary text-white py-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Package className="w-5 h-5 opacity-80" />
                  Order Summary
                </CardTitle>
                <Badge variant="outline" className="text-white border-white/30 bg-white/10 uppercase tracking-widest text-[10px]">
                  {orderDetails.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Order ID</p>
                  <p className="font-mono font-bold text-foreground">#{orderDetails.orderId}</p>
                </div>
                <div className="space-y-1 sm:text-right">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Order Type</p>
                  <p className="font-bold text-teal-600 text-sm uppercase">{orderDetails.type.replace(/_/g, " ")}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Order Date</p>
                  <p className="font-bold text-foreground">{formatDate(new Date())}</p>
                </div>
                <div className="space-y-1 sm:text-right">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-teal-600">Total Paid</p>
                  <p className="text-2xl font-black text-foreground">{formatPrice(orderDetails.amount)}</p>
                </div>
              </div>

              <Separator />

              {/* Next Steps */}
              <div className="space-y-4">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Truck className="w-5 h-5 text-teal-600" />
                  What happens next?
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex gap-4 p-4 rounded-xl bg-muted/30 border border-muted/50 group hover:border-teal-200 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center shrink-0 font-bold text-teal-600 text-sm">1</div>
                    <p className="text-sm text-muted-foreground leading-snug">
                      You'll receive a detailed receipt and tracking link via <span className="text-foreground font-bold">Email & WhatsApp</span> within 30 minutes.
                    </p>
                  </div>
                  <div className="flex gap-4 p-4 rounded-xl bg-muted/30 border border-muted/50 group hover:border-teal-200 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center shrink-0 font-bold text-teal-600 text-sm">2</div>
                    <p className="text-sm text-muted-foreground leading-snug">
                      Our dispatch team will assign your order to a delivery partner for <span className="text-foreground font-bold">tomorrow's early morning slot</span>.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="bg-teal-600 p-1"></div>
          </Card>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Button asChild variant="outline" className="w-full sm:w-auto h-12 px-8 border-primary text-primary hover:bg-muted font-bold tracking-wide">
              <Link href="/dashboard">
                View All Orders
              </Link>
            </Button>
            <Button asChild className="w-full sm:w-auto h-12 px-8 bg-teal-600 hover:bg-teal-700 text-white font-bold tracking-wide shadow-lg shadow-teal-600/20">
              <Link href="/products" className="flex items-center gap-2">
                Continue Shopping
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
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
