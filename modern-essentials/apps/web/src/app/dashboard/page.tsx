"use client";

import { formatDate, formatPrice } from "@/lib/utils";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Heading,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from "@modern-essentials/ui";
import { ChevronRight, History, LayoutDashboard, Package } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export const runtime = "edge";

interface Subscription {
  id: string;
  product: {
    name: string;
    price: number;
    subPrice?: number;
  };
  quantity: number;
  frequency: string;
  status: string;
  nextBillingAt: string;
}

interface Order {
  id: string;
  status: string;
  total: number;
  placedAt: string;
  items: Array<{
    product: { name: string };
    qty: number;
  }>;
}

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchDashboardData();
    }
  }, [isLoaded, isSignedIn]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = (await getToken()) || user?.id || "test-user-123";

      const [subsRes, ordersRes] = await Promise.all([
        fetch(`${apiUrl}/subscriptions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${apiUrl}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!subsRes.ok || !ordersRes.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const [subsData, ordersData] = await Promise.all([
        subsRes.json(),
        ordersRes.json(),
      ]);

      setSubscriptions(subsData);
      setOrders(ordersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-surface px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-surface">
        <Heading variant="h2" className="mb-4">
          Access Denied
        </Heading>
        <Text className="mb-6">Please sign in to view your dashboard.</Text>
        <Button asChild>
          <Link href="/sign-in">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
          <div className="space-y-1">
            <Heading
              variant="h1"
              className="text-2xl md:text-3xl text-primary font-bold"
            >
              Welcome, {user.firstName || "Customer"}!
            </Heading>
            <Text className="text-primary/60 text-sm">
              Manage your fresh essentials and active plans.
            </Text>
          </div>
        </header>

        {error && (
          <Badge
            variant="destructive"
            className="w-full py-2 px-4 mb-8 text-sm justify-center rounded-lg font-bold uppercase tracking-widest"
          >
            {error}
          </Badge>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content - 8 cols */}
          <div className="lg:col-span-8 space-y-8">
            {/* Subscriptions Card */}
            <Card className="border-none bg-surface-container-low shadow-sm rounded-2xl overflow-hidden ring-1 ring-primary/5">
              <CardHeader className="px-5 py-5 flex flex-row items-center justify-between space-y-0 border-b border-primary/5">
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-secondary" />
                  <CardTitle className="text-lg font-bold text-primary">
                    Active Subscriptions
                  </CardTitle>
                </div>
                <Button
                  asChild
                  variant="ghost"
                  className="text-secondary font-black tracking-widest uppercase text-[9px] h-auto py-1.5 hover:bg-secondary/5"
                >
                  <Link href="/products">+ Add New</Link>
                </Button>
              </CardHeader>
              <CardContent className="px-5 py-5">
                {subscriptions.length === 0 ? (
                  <div className="text-center py-8 space-y-4">
                    <Text className="text-primary/60 text-xs italic">
                      No active subscriptions found.
                    </Text>
                    <Button
                      asChild
                      variant="outline"
                      className="h-10 px-6 rounded-full text-[10px] font-black uppercase tracking-widest border-primary/10"
                    >
                      <Link href="/products">Browse Collection</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {subscriptions.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/account/subscriptions/${sub.id}`}
                        className="flex items-center justify-between p-4 bg-surface rounded-xl hover:bg-surface-container-high transition-all shadow-sm group border border-primary/5"
                      >
                        <div className="space-y-0.5">
                          <Heading
                            variant="h4"
                            className="text-base text-primary group-hover:text-secondary transition-colors font-bold"
                          >
                            {sub.product.name}
                          </Heading>
                          <Text
                            variant="small"
                            className="text-primary/40 capitalize text-[10px] font-bold tracking-tight"
                          >
                            {sub.quantity} units • {sub.frequency.toLowerCase()}
                          </Text>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <div className="space-y-1">
                            <Badge
                              variant={
                                sub.status === "ACTIVE"
                                  ? "default"
                                  : "secondary"
                              }
                              className="font-black uppercase tracking-widest px-2 py-0.5 text-[8px] border-none"
                            >
                              {sub.status}
                            </Badge>
                            <Text className="text-primary/30 block text-[8px] font-bold uppercase">
                              Next: {formatDate(sub.nextBillingAt)}
                            </Text>
                          </div>
                          <ChevronRight className="h-4 w-4 text-primary/10 group-hover:text-secondary transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order History Card */}
            <Card className="border-none bg-surface-container-low shadow-sm rounded-2xl overflow-hidden ring-1 ring-primary/5">
              <CardHeader className="px-5 py-5 border-b border-primary/5">
                <div className="flex items-center gap-2.5">
                  <History className="w-4 h-4 text-secondary" />
                  <CardTitle className="text-lg font-bold text-primary">
                    Recent Activity
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {orders.length === 0 ? (
                  <div className="p-10 text-center">
                    <Text className="text-primary/40 text-xs italic">
                      No orders yet.
                    </Text>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-primary/5">
                        <TableRow className="hover:bg-transparent border-none">
                          <TableHead className="px-5 py-3 text-[9px] font-black text-primary/40 uppercase tracking-[0.15em] h-auto">
                            Ref
                          </TableHead>
                          <TableHead className="px-5 py-3 text-[9px] font-black text-primary/40 uppercase tracking-[0.15em] h-auto">
                            Date
                          </TableHead>
                          <TableHead className="px-5 py-3 text-[9px] font-black text-primary/40 uppercase tracking-[0.15em] h-auto text-right">
                            Total
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow
                            key={order.id}
                            className="hover:bg-primary/5 transition-colors border-primary/5"
                          >
                            <TableCell className="px-5 py-4 font-mono text-[10px] font-bold text-primary/80">
                              #{order.id.slice(-6)}
                            </TableCell>
                            <TableCell className="px-5 py-4 text-[10px] text-primary/60 font-medium">
                              {formatDate(order.placedAt)}
                            </TableCell>
                            <TableCell className="px-5 py-4 text-sm font-bold text-primary text-right">
                              {formatPrice(order.total)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Content - 4 cols */}
          <div className="lg:col-span-4 space-y-6">
            <Card
              id="rewards"
              className="bg-primary text-white rounded-2xl border-none p-6 shadow-md relative overflow-hidden ring-1 ring-primary/10"
            >
              <div className="relative z-10 space-y-5">
                <div className="space-y-1.5">
                  <Heading
                    variant="h3"
                    className="text-white text-lg font-bold tracking-tight"
                  >
                    Member Rewards
                  </Heading>
                  <Text
                    variant="small"
                    className="text-white/60 leading-relaxed text-xs"
                  >
                    Earned 250 points this month.
                  </Text>
                </div>
                <div className="space-y-2">
                  <div className="bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-secondary h-full rounded-full transition-all duration-1000"
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Text
                      variant="xs"
                      className="text-white/30 text-[8px] font-black uppercase tracking-widest"
                    >
                      Progress
                    </Text>
                    <Text
                      variant="xs"
                      className="text-white/30 text-[8px] font-black uppercase tracking-widest"
                    >
                      60% to Reward
                    </Text>
                  </div>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="w-full bg-secondary text-white rounded-lg shadow-sm hover:brightness-110 font-black tracking-[0.1em] uppercase text-[9px]"
                >
                  <Link href="/rewards">Open Rewards Hub</Link>
                </Button>
              </div>
              <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-secondary/10 rounded-full blur-2xl"></div>
            </Card>

            <Card className="bg-surface-container-low rounded-2xl border-none p-6 shadow-sm ring-1 ring-primary/5">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-secondary" />
                  <CardTitle className="text-base font-bold text-primary tracking-tight">
                    Support
                  </CardTitle>
                </div>
                <Text
                  variant="small"
                  className="text-primary/50 leading-relaxed text-xs font-medium"
                >
                  Have questions about your plan? Our concierge team is here to
                  help.
                </Text>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-primary/10 text-primary rounded-lg font-bold hover:bg-primary/5 transition-all h-10 text-[10px] uppercase tracking-widest shadow-sm"
                >
                  Contact Concierge
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
