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
    ACTIVE: "bg-green-100 text-green-800 border-green-200",
    PAUSED: "bg-yellow-100 text-yellow-800 border-yellow-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
    PENDING: "bg-blue-100 text-blue-800 border-blue-200",
    DUNNING: "bg-orange-100 text-orange-800 border-orange-200",
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold">{subscription.productName}</CardTitle>
          <Badge className={statusColors[subscription.status as keyof typeof statusColors] || ""}>
            {subscription.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <Package className="mr-2 h-4 w-4" />
          <span>{subscription.quantity} Units</span>
          <span className="mx-2">•</span>
          <RefreshCw className="mr-2 h-4 w-4" />
          <span className="capitalize">{subscription.frequency.toLowerCase()}</span>
        </div>
        
        <div className="flex items-center text-sm">
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>Next Delivery: {format(new Date(subscription.nextDeliveryAt), "MMM d, yyyy")}</span>
        </div>

        <div className="pt-2">
          <span className="text-2xl font-bold text-teal-600">
            ₹{(subscription.price / 100).toFixed(2)}
          </span>
          <span className="text-sm text-muted-foreground ml-1">/ delivery</span>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 border-t pt-4">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/account/subscriptions/${subscription.id}`}>
            Manage Subscription
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
