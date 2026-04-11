"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import {
  Button,
  Input,
  Label,
} from "@modern-essentials/ui";
import { ArrowRight, ShieldCheck, ShoppingBag } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useCart } from "../../contexts/CartContext";

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
  const { getToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSubscription = searchParams?.get("plan") === "subscribe";
  const [isHydrated, setIsHydrated] = useState(false);

  const { items, totalItems, totalAmount, clearCart } = useCart();
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
          token = (await getToken()) || user?.id || "test-user-123";
        } catch (error) {
          console.warn("Failed to get token, using fallback");
        }
      }

      const hasSubscription = items.some((item) => item.isSubscription);
      const endpoint = hasSubscription ? "create-subscription" : "create-order";

      const orderResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/checkout/${endpoint}`,
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
              isSubscription: item.isSubscription,
              frequency: item.frequency,
            })),
          }),
        },
      );

      if (!orderResponse.ok) {
        throw new Error("Order Request Failed");
      }

      const checkoutData = await orderResponse.json();

      const options: any = {
        key: checkoutData.key,
        name: "Modern Essentials",
        description: "Fresh delivery directly to your door",
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#111827",
        },
        handler: async (response: any) => {
          try {
            let verifyToken = "test-user-123";
            if (isSignedIn && user) {
              try {
                verifyToken = (await getToken()) || user.id || "test-user-123";
              } catch (error) {
                // Ignore
              }
            }

            // For subscriptions, Razorpay returns subscription_id instead of order_id
            const verifyPayload: any = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData: {
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
                  isSubscription: item.isSubscription,
                  frequency: item.frequency,
                })),
              },
            };

            if (hasSubscription) {
              verifyPayload.razorpay_subscription_id =
                response.razorpay_subscription_id;
            } else {
              verifyPayload.razorpay_order_id = response.razorpay_order_id;
            }

            const verifyResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/checkout/verify-payment`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${verifyToken}`,
                },
                body: JSON.stringify(verifyPayload),
              },
            );

            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              // Clear the cart on the frontend after successful purchase
              await clearCart();
              
              router.push(
                `/order-confirmation?orderId=${verifyData.orderId || "success"}`,
              );
            } else {
              throw new Error("Could not verify payment securely.");
            }
          } catch (error) {
            setError("Payment verification failed. Please contact support.");
          }
        },
      };

      if (hasSubscription) {
        options.subscription_id = checkoutData.subscriptionId;
      } else {
        options.order_id = checkoutData.razorpayOrderId;
        options.amount = checkoutData.amount;
        options.currency = checkoutData.currency;
      }

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
            Seems you haven't added anything. Load up on fresh essentials to
            continue checkout.
          </p>
          <Button
            size="lg"
            className="px-8 mt-4"
            onClick={() => router.push("/products")}
          >
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-16 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <p className="text-[#3AAFA9] font-sans font-bold tracking-[0.2em] text-xs uppercase">Secure Checkout</p>
            <h1 className="text-4xl md:text-5xl font-headline tracking-tight text-foreground">
              Finalize Your Selection
            </h1>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-sans tracking-wider uppercase bg-surface-container-high px-5 py-3 rounded-none">
            <ShieldCheck className="w-4 h-4 text-[#3AAFA9]" />
            Encrypted & Secure
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-16">
          {/* Checkout Form */}
          <div className="xl:col-span-7 space-y-12">
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-[#3AAFA9] text-white flex items-center justify-center font-headline text-sm">1</span>
                <h2 className="text-2xl font-headline text-foreground">Delivery Information</h2>
              </div>
              
              <form
                id="checkout-form"
                onSubmit={handleSubmit}
                className="space-y-10"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="h-10 bg-transparent border-0 border-b border-outline-variant/40 focus-visible:border-[#3AAFA9] focus-visible:ring-0 rounded-none px-0 transition-colors placeholder:text-muted-foreground/30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="h-10 bg-transparent border-0 border-b border-outline-variant/40 focus-visible:border-[#3AAFA9] focus-visible:ring-0 rounded-none px-0 transition-colors placeholder:text-muted-foreground/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="h-10 bg-transparent border-0 border-b border-outline-variant/40 focus-visible:border-[#3AAFA9] focus-visible:ring-0 rounded-none px-0 transition-colors placeholder:text-muted-foreground/30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="h-10 bg-transparent border-0 border-b border-outline-variant/40 focus-visible:border-[#3AAFA9] focus-visible:ring-0 rounded-none px-0 transition-colors placeholder:text-muted-foreground/30"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-4">
                  <Label htmlFor="addressLine1" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Street Address</Label>
                  <Input
                    id="addressLine1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    required
                    className="h-10 bg-transparent border-0 border-b border-outline-variant/40 focus-visible:border-[#3AAFA9] focus-visible:ring-0 rounded-none px-0 transition-colors placeholder:text-muted-foreground/30"
                    placeholder="123 Farm Lane, Apt 4"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-10 gap-y-8">
                  <div className="space-y-1.5">
                    <Label htmlFor="postalCode" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Postal Code</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                      className="h-10 bg-transparent border-0 border-b border-outline-variant/40 focus-visible:border-[#3AAFA9] focus-visible:ring-0 rounded-none px-0 transition-colors placeholder:text-muted-foreground/30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="h-10 bg-transparent border-0 border-b border-outline-variant/40 focus-visible:border-[#3AAFA9] focus-visible:ring-0 rounded-none px-0 transition-colors placeholder:text-muted-foreground/30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="state" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="h-10 bg-transparent border-0 border-b border-outline-variant/40 focus-visible:border-[#3AAFA9] focus-visible:ring-0 rounded-none px-0 transition-colors placeholder:text-muted-foreground/30"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-5 bg-destructive/5 border-l-2 border-destructive text-destructive text-sm font-sans flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                    {error}
                  </div>
                )}
              </form>
            </section>
          </div>

          {/* Order Summary & Finalize - Tonal Layering */}
          <div className="xl:col-span-5">
            <div className="bg-surface-container-low p-8 md:p-10 sticky top-24 space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-headline text-foreground">
                  {isSubscription ? "Your Plan" : "Summary"}
                </h2>
                <p className="text-xs text-muted-foreground font-sans tracking-wider uppercase">
                  {totalItems} items selected
                </p>
              </div>

              <div className="space-y-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start"
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-16 h-16 bg-surface-container-high overflow-hidden">
                        {item.product.images.length > 0 && (
                          <img
                            src={item.product.images[0].url}
                            className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-500"
                            alt=""
                          />
                        )}
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-headline text-base text-foreground leading-tight">
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground font-sans">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-headline text-base text-foreground whitespace-nowrap pt-1">
                      Rs.{" "}
                      {((item.priceSnapshot * item.quantity) / 100).toFixed(
                        2,
                      )}
                    </p>
                  </div>
                ))}

                <div className="pt-6 space-y-4 border-t border-outline-variant/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-sans">Subtotal</span>
                    <span className="font-headline text-foreground">
                      Rs. {(totalAmount / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-sans">
                      Shipping
                    </span>
                    <span className="font-sans font-bold text-[#3AAFA9] tracking-widest text-[10px] uppercase">
                      Complimentary
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-outline-variant/20">
                  <span className="font-headline text-foreground text-xl">
                    Total
                  </span>
                  <span className="font-headline text-3xl tracking-tight text-foreground">
                    Rs. {(totalAmount / 100).toFixed(2)}
                  </span>
                </div>
                
                <Button
                  type="submit"
                  form="checkout-form"
                  disabled={loading}
                  size="lg"
                  className="w-full text-sm font-bold tracking-[0.2em] uppercase h-16 bg-[#3AAFA9] hover:bg-[#2B7A78] text-white rounded-none transition-all duration-300"
                >
                  {loading
                    ? "Authenticating Gateway..."
                    : "Complete Purchase"}
                  {!loading && <ArrowRight className="w-4 h-4 ml-3" />}
                </Button>
                
                <p className="text-[10px] text-center text-muted-foreground font-sans uppercase tracking-[0.1em] mt-4">
                  By completing your purchase, you agree to our Terms of Curation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading secure checkout...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
