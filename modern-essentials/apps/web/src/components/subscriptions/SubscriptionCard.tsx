"use client";

import { Badge, Button, Card, CardContent, CardFooter, CardHeader, Heading, Text } from "@modern-essentials/ui";
import { Calendar, Package, RefreshCw } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface SubscriptionCardProps {
  subscription: {
    id: string;
    productName: string;
    quantity: number;
    frequency: string;
    status: string;
    nextDeliveryAt: string;
    price: number;
    product: {
      name: string;
    };
  };
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    ACTIVE: "default",
    PAUSED: "secondary",
    CANCELLED: "destructive",
    PENDING: "outline",
    DUNNING: "destructive",
  };

  return (
    <Card className="overflow-hidden border-none bg-surface-container-low shadow-sm hover:shadow-xl transition-all duration-500 rounded-[32px]">
      <CardHeader className="pb-4 px-6 pt-8">
        <div className="flex justify-between items-start gap-4">
          <Heading variant="h3" className="text-xl md:text-2xl text-primary leading-tight group-hover:text-secondary transition-colors">
            {subscription.productName}
          </Heading>
          <Badge variant={statusVariants[subscription.status] || "outline"} className="font-black uppercase tracking-widest px-3 py-1 rounded-full text-[9px] border-none shadow-sm">
            {subscription.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pb-6 px-6">
        <div className="flex flex-wrap items-center gap-y-3 gap-x-6">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-secondary" />
            <Text variant="small" className="text-primary/60 font-bold">{subscription.quantity} Units</Text>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-secondary" />
            <Text variant="small" className="text-primary/60 font-bold capitalize">{subscription.frequency.toLowerCase()}</Text>
          </div>
        </div>
        
        <div className="bg-surface border-none p-4 rounded-2xl shadow-inner flex items-center gap-3">
          <Calendar className="h-4 w-4 text-primary/30" />
          <Text variant="xs" className="text-primary/60 font-bold uppercase tracking-widest text-[9px]">
            Next: {format(new Date(subscription.nextDeliveryAt), "MMM d, yyyy")}
          </Text>
        </div>

        <div className="pt-2 flex items-baseline gap-2">
          <Heading variant="h2" className="text-2xl md:text-3xl text-primary tracking-tighter">
            ₹{(subscription.price / 100).toFixed(2)}
          </Heading>
          <Text variant="xs" className="text-primary/30 font-bold uppercase tracking-widest text-[9px]">/ delivery</Text>
        </div>
      </CardContent>
      <CardFooter className="px-6 pb-8 pt-0">
        <Button asChild className="w-full bg-secondary hover:brightness-110 text-white shadow-lg h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
          <Link href={`/account/subscriptions/${subscription.id}`}>
            Manage Plan
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
