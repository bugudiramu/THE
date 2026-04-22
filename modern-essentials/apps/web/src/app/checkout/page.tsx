"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import {
  Button,
  Input,
  Heading,
  Text,
  Badge,
  Card,
  Separator,
  AspectRatio,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Alert,
  AlertDescription,
  Skeleton,
} from "@modern-essentials/ui";
import { ArrowRight, ShieldCheck, ShoppingBag, Truck, CreditCard } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useCart } from "../../contexts/CartContext";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Invalid phone number"),
  addressLine1: z.string().min(5, "Address is too short"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(6, "Invalid postal code"),
});

type FormData = z.infer<typeof formSchema>;

function CheckoutContent() {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSubscription = searchParams?.get("plan") === "subscribe";
  const [isHydrated, setIsHydrated] = useState(false);

  const { items, totalItems, totalAmount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.emailAddresses[0]?.emailAddress || "",
      phone: "",
      addressLine1: "",
      city: "",
      state: "",
      postalCode: "",
    },
  });

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

  const onSubmit = async (values: FormData) => {
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
            name: `${values.firstName} ${values.lastName}`,
            phone: values.phone,
            address: values.addressLine1,
            city: values.city,
            state: values.state,
            pincode: values.postalCode,
            items: items.map((item) => ({
              variantId: item.variantId,
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
          name: `${values.firstName} ${values.lastName}`,
          email: values.email,
          contact: values.phone,
        },
        theme: {
          color: "#2B7A78",
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

            const verifyPayload: any = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData: {
                name: `${values.firstName} ${values.lastName}`,
                phone: values.phone,
                address: values.addressLine1,
                city: values.city,
                state: values.state,
                pincode: values.postalCode,
                items: items.map((item) => ({
                  variantId: item.variantId,
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
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
        <Card className="max-w-sm w-full border-none bg-surface-container-low rounded-2xl p-10 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-surface rounded-full mx-auto flex items-center justify-center shadow-inner">
            <ShoppingBag className="w-8 h-8 text-primary/20" />
          </div>
          <div className="space-y-2">
            <Heading variant="h2">Cart is empty</Heading>
            <Text className="text-primary/60 text-sm">
              Add some fresh essentials to continue checkout.
            </Text>
          </div>
          <Button
            size="lg"
            className="w-full bg-secondary h-12 rounded-full font-bold uppercase tracking-widest text-xs"
            onClick={() => router.push("/products")}
          >
            Start Shopping
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <Text variant="xs" className="text-secondary font-black">Secure Checkout</Text>
            <Heading variant="h1" className="text-3xl text-primary leading-tight font-bold">
              Finalize Your Selection
            </Heading>
          </div>
          <Badge variant="outline" className="h-auto py-2 px-4 rounded-full border-primary/10 bg-surface-container-low text-primary/60 gap-2 text-[10px] font-bold uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
            Encrypted & Secure
          </Badge>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Checkout Form */}
          <div className="lg:col-span-7 space-y-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                <section className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-headline text-sm font-bold shadow-sm">1</div>
                    <Heading variant="h3" className="text-primary text-xl">Delivery Information</Heading>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }: { field: ControllerRenderProps<FormData, any> }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase tracking-widest text-primary/40 font-black">First Name</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-transparent border-0 border-b border-primary/10 rounded-none px-0 h-10 focus-visible:ring-0 focus-visible:border-secondary transition-colors text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }: { field: ControllerRenderProps<FormData, any> }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase tracking-widest text-primary/40 font-black">Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-transparent border-0 border-b border-primary/10 rounded-none px-0 h-10 focus-visible:ring-0 focus-visible:border-secondary transition-colors text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }: { field: ControllerRenderProps<FormData, any> }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase tracking-widest text-primary/40 font-black">Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" className="bg-transparent border-0 border-b border-primary/10 rounded-none px-0 h-10 focus-visible:ring-0 focus-visible:border-secondary transition-colors text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }: { field: ControllerRenderProps<FormData, any> }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase tracking-widest text-primary/40 font-black">Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} type="tel" className="bg-transparent border-0 border-b border-primary/10 rounded-none px-0 h-10 focus-visible:ring-0 focus-visible:border-secondary transition-colors text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="addressLine1"
                    render={({ field }: { field: ControllerRenderProps<FormData, any> }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] uppercase tracking-widest text-primary/40 font-black">Street Address</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="123 Farm Lane, Apt 4" className="bg-transparent border-0 border-b border-primary/10 rounded-none px-0 h-10 focus-visible:ring-0 focus-visible:border-secondary transition-colors text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6">
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }: { field: ControllerRenderProps<FormData, any> }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase tracking-widest text-primary/40 font-black">Postal Code</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-transparent border-0 border-b border-primary/10 rounded-none px-0 h-10 focus-visible:ring-0 focus-visible:border-secondary transition-colors text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }: { field: ControllerRenderProps<FormData, any> }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase tracking-widest text-primary/40 font-black">City</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-transparent border-0 border-b border-primary/10 rounded-none px-0 h-10 focus-visible:ring-0 focus-visible:border-secondary transition-colors text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }: { field: ControllerRenderProps<FormData, any> }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase tracking-widest text-primary/40 font-black">State</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-transparent border-0 border-b border-primary/10 rounded-none px-0 h-10 focus-visible:ring-0 focus-visible:border-secondary transition-colors text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-headline text-sm font-bold shadow-sm">2</div>
                    <Heading variant="h3" className="text-primary text-xl">Payment</Heading>
                  </div>
                  
                  <Card className="bg-surface-container-low border-none rounded-2xl p-6 space-y-4 ring-1 ring-primary/5">
                    <div className="flex items-start gap-4">
                      <CreditCard className="w-5 h-5 text-secondary mt-0.5" />
                      <div className="space-y-1">
                        <Heading variant="h4" className="text-primary text-base">Razorpay Secure</Heading>
                        <Text variant="small" className="text-primary/50 text-xs">You will be redirected to complete your payment.</Text>
                      </div>
                    </div>
                  </Card>

                  {error && (
                    <Alert variant="destructive" className="rounded-xl p-4">
                      <AlertDescription className="text-xs font-bold">{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    size="lg"
                    className="w-full h-14 bg-secondary hover:brightness-110 text-white rounded-full font-black uppercase tracking-widest text-xs shadow-lg shadow-secondary/20 transition-all"
                  >
                    {loading ? "Processing..." : "Complete Purchase"}
                    {!loading && <ArrowRight className="ml-3 w-4 h-4" />}
                  </Button>
                  
                  <Text variant="xs" className="text-center text-primary/20 font-black uppercase text-[8px]">
                    By continuing, you agree to our Terms of Curation.
                  </Text>
                </div>
              </form>
            </Form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <Card className="bg-surface-container-low border-none rounded-3xl p-8 space-y-8 shadow-sm ring-1 ring-primary/5">
              <div className="space-y-1">
                <Heading variant="h2" className="text-primary text-2xl tracking-tight font-bold">{isSubscription ? "Your Plan" : "Summary"}</Heading>
                <Text variant="xs" className="text-secondary font-black uppercase tracking-widest text-[9px]">{totalItems} items selected</Text>
              </div>

              <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start gap-4">
                    <div className="flex gap-4 flex-1">
                      <AspectRatio ratio={1} className="w-14 rounded-xl overflow-hidden bg-surface shadow-inner border border-primary/5">
                        {item.variant.product.images.length > 0 ? (
                          <Image src={item.variant.product.images[0].url} alt="" fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-4 h-4 text-primary/10" /></div>
                        )}
                      </AspectRatio>
                      <div className="space-y-0.5">
                        <Heading variant="h5" className="text-primary text-sm line-clamp-1 font-bold">{item.variant.product.name} ({item.variant.packSize}pk)</Heading>
                        <Text variant="xs" className="text-primary/40 font-bold uppercase text-[9px]">Qty: {item.quantity}</Text>
                      </div>
                    </div>
                    <Text className="font-headline font-bold text-primary text-sm">
                      ₹{((item.priceSnapshot * item.quantity) / 100).toFixed(2)}
                    </Text>
                  </div>
                ))}
              </div>

              <Separator className="bg-primary/5" />

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Text variant="xs" className="text-primary/40 font-black uppercase tracking-widest text-[9px]">Subtotal</Text>
                  <Text className="font-headline font-bold text-primary">₹{(totalAmount / 100).toFixed(2)}</Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text variant="xs" className="text-primary/40 font-black uppercase tracking-widest text-[9px]">Shipping</Text>
                  <Text variant="xs" className="text-secondary font-black uppercase tracking-widest text-[9px]">Complimentary</Text>
                </div>
              </div>

              <div className="flex justify-between items-end pt-6 border-t border-primary/5">
                <Heading variant="h3" className="text-primary text-xl font-bold">Total</Heading>
                <Heading variant="h1" className="text-3xl text-primary font-bold tracking-tighter">₹{(totalAmount / 100).toFixed(2)}</Heading>
              </div>

              <Card className="bg-primary/5 p-4 rounded-xl border-none shadow-inner">
                <div className="flex gap-3">
                  <Truck className="w-4 h-4 text-secondary shrink-0" />
                  <Text variant="xs" className="text-primary/50 leading-relaxed font-bold uppercase text-[8px]">
                    Harvested fresh and delivered according to your curation.
                  </Text>
                </div>
              </Card>
            </Card>
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
        <div className="min-h-screen flex items-center justify-center bg-surface">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
