"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useCart } from "../../contexts/CartContext";
import { Input, Label, Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Separator } from "@modern-essentials/ui";
import { ShieldCheck, Truck, ArrowRight, ShoppingBag } from "lucide-react";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
}

function CheckoutContent() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSubscription = searchParams?.get("plan") === "subscribe";
  const [isHydrated, setIsHydrated] = useState(false);

  const { items, totalItems, totalAmount } = useCart();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof globalThis !== "undefined") {
      const script = (globalThis as any).document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      (globalThis as any).document.body.appendChild(script);

      return () => {
        (globalThis as any).document.body.removeChild(script);
      };
    }
    return undefined;
  }, []);

  if (!isHydrated) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as any;
    setFormData({
      ...formData,
      [target.name]: target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let token = "test-user-123";
      if (isSignedIn && user) {
        try {
          token = await (user as any).getToken();
        } catch (error) {
          console.warn("Failed to get token, using fallback");
        }
      }

      const orderResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/checkout/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone,
            address: formData.addressLine1,
            city: formData.city,
            state: formData.state,
            pincode: formData.postalCode,
            items: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.priceSnapshot,
            })),
          }),
        },
      );

      if (!orderResponse.ok) {
        throw new Error("Order Request Failed");
      }

      const order = (await orderResponse.json()) as {
        razorpayOrderId: string;
        amount: number;
        currency: string;
        key: string;
      };

      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "Modern Essentials",
        description: "Fresh delivery directly to your door",
        order_id: order.razorpayOrderId,
        handler: async (response: any) => {
          try {
            let verifyToken = "test-user-123";
            if (isSignedIn && user) {
              try {
                verifyToken = await (user as any).getToken();
              } catch (error) {
                // Ignore
              }
            }

            const verifyResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/checkout/verify-payment`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${verifyToken}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderData: { // Original payload mirroring
                    name: `${formData.firstName} ${formData.lastName}`,
                    phone: formData.phone,
                    address: formData.addressLine1,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.postalCode,
                    items: items.map((item) => ({
                      productId: item.productId,
                      quantity: item.quantity,
                      price: item.priceSnapshot,
                    })),
                  },
                }),
              },
            );

            if (verifyResponse.ok) {
              if (typeof globalThis !== "undefined") {
                router.push("/order-confirmation");
              }
            } else {
              throw new Error("Could not verify payment securely.");
            }
          } catch (error) {
            setError("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#111827", // matches primary brand color
        },
      };

      if (typeof globalThis !== "undefined" && (globalThis as any).Razorpay) {
        const razorpay = new (globalThis as any).Razorpay(options);
        razorpay.open();
      } else {
        setError("Payment bridge unavailable. Try disabling adblock.");
      }
    } catch (error) {
       setError("Checkout initialization failed.");
    } finally {
      setLoading(false);
    }
  };

  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-10 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-24 h-24 bg-muted rounded-full mx-auto flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Cart is empty
          </h1>
          <p className="text-muted-foreground text-lg">
            Seems you haven't added anything. Load up on fresh essentials to continue checkout.
          </p>
          <Button size="lg" className="px-8 mt-4" onClick={() => router.push("/products")}>
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 py-12 pb-24 border-t">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-8 md:mb-12">
           <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Secure Checkout</h1>
           <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground font-medium bg-background px-4 py-2 border rounded-full shadow-sm">
             <ShieldCheck className="w-4 h-4 text-emerald-600" />
             SSL Encrypted Transaction
           </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          {/* Checkout Form */}
          <div className="xl:col-span-7 space-y-6">
            <Card className="shadow-sm border-muted">
              <CardHeader className="bg-muted/30 border-b pb-6">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Delivery Information
                </CardTitle>
                <CardDescription>
                  Enter details on where we should drop your essentials.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <form
                  id="checkout-form"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="h-12 bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="h-12 bg-background"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="h-12 bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="h-12 bg-background"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="addressLine1">Street Address</Label>
                    <Input
                      id="addressLine1"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleInputChange}
                      required
                      className="h-12 bg-background"
                      placeholder="123 Farm Lane, Apt 4"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="sm:col-span-1 space-y-2">
                      <Label htmlFor="postalCode">Postal / VIP Code</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        required
                        className="h-12 bg-background"
                      />
                    </div>
                    <div className="sm:col-span-1 space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="h-12 bg-background"
                      />
                    </div>
                    <div className="sm:col-span-1 space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="h-12 bg-background"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 shrink-0" />
                      {error}
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & Finalize */}
          <div className="xl:col-span-5">
            <Card className="shadow-sm border-muted sticky top-24">
              <CardHeader className="bg-muted/30 border-b pb-6">
                <CardTitle className="text-xl">{isSubscription ? "Subscription Plan" : "Order Summary"}</CardTitle>
                <CardDescription>{totalItems} fresh items in your cart.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-5">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start group">
                      <div className="flex gap-3">
                         <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-md border overflow-hidden">
                           {item.product.images.length > 0 && (
                             <img src={item.product.images[0].url} className="w-full h-full object-cover" alt="" />
                           )}
                         </div>
                         <div>
                            <h3 className="font-bold text-sm text-foreground leading-tight">{item.product.name}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Qty {item.quantity}</p>
                         </div>
                      </div>
                      <p className="font-semibold text-sm text-foreground whitespace-nowrap pt-1">
                        ₹{((item.priceSnapshot * item.quantity) / 100).toFixed(2)}
                      </p>
                    </div>
                  ))}
                  
                  <Separator className="mt-2" />
                  
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium text-foreground">₹{(totalAmount / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Premium Shipping</span>
                      <span className="font-medium text-emerald-600">Calculated</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center py-2">
                    <span className="font-extrabold text-foreground text-lg">Total</span>
                    <span className="font-black text-2xl tracking-tight text-foreground">
                      ₹{(totalAmount / 100).toFixed(2)}
                    </span>
                  </div>

                    <Button
                      type="submit"
                      form="checkout-form"
                      disabled={loading}
                      size="lg"
                      className="w-full h-14 text-lg font-bold tracking-wide mt-2 shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5"
                    >
                      {loading ? "Initializing Secure Gateway..." : "Complete Order"}
                      {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
                    </Button>
                  
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading secure checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
