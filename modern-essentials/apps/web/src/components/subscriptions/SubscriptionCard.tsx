"use client";

import { Badge } from "@modern-essentials/ui";
import { Button } from "@modern-essentials/ui";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@modern-essentials/ui";
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
  const statusColors = {
    ACTIVE: "bg-primary/10 text-primary border-transparent",
    PAUSED: "bg-secondary/10 text-secondary border-transparent",
    CANCELLED: "bg-red-50 text-red-700 border-transparent",
    PENDING: "bg-blue-50 text-blue-700 border-transparent",
    DUNNING: "bg-orange-50 text-orange-700 border-transparent",
  };

  return (
    <Card className="overflow-hidden border-none bg-surface-container-low shadow-[0px_20px_40px_rgba(6,27,14,0.04)] rounded-xl">
      <CardHeader className="pb-4 px-8 pt-8">
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-2xl font-headline font-bold text-primary leading-tight">
            {subscription.productName}
          </CardTitle>
          <Badge className={`${statusColors[subscription.status as keyof typeof statusColors] || ""} font-bold px-3 py-1 rounded-full text-xs`}>
            {subscription.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pb-6 px-8">
        <div className="flex items-center text-sm text-primary/60 font-medium">
          <Package className="mr-2 h-4 w-4 opacity-50" />
          <span>{subscription.quantity} Units</span>
          <span className="mx-3 text-primary/20">•</span>
          <RefreshCw className="mr-2 h-4 w-4 opacity-50" />
          <span className="capitalize">{subscription.frequency.toLowerCase()}</span>
        </div>
        
        <div className="flex items-center text-sm text-primary/70">
          <Calendar className="mr-2 h-4 w-4 opacity-50" />
          <span className="font-medium">Next Delivery: {format(new Date(subscription.nextDeliveryAt), "MMM d, yyyy")}</span>
        </div>

        <div className="pt-2">
          <span className="text-3xl font-headline font-bold text-primary">
            ₹{(subscription.price / 100).toFixed(2)}
          </span>
          <span className="text-sm text-primary/40 ml-2 font-medium">/ delivery</span>
        </div>
      </CardContent>
      <CardFooter className="px-8 pb-8 pt-0">
        <Button asChild className="w-full bg-secondary text-white hover:brightness-110 shadow-sm py-6 rounded-xl text-base font-bold transition-all">
          <Link href={`/account/subscriptions/${subscription.id}`}>
            Manage Subscription
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
