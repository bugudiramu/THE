"use client";

import { useState } from "react";
import { Card, CardContent, RadioGroup, RadioGroupItem, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge } from "@modern-essentials/ui";
interface SubscriptionToggleProps {
  price: number; 
  subPrice?: number; 
  onSubscriptionChange: (isSubscription: boolean, frequency: string) => void;
}

export default function SubscriptionToggle({
  price,
  subPrice,
  onSubscriptionChange,
}: SubscriptionToggleProps) {
  const [isSubscription, setIsSubscription] = useState("true");
  const [frequency, setFrequency] = useState("WEEKLY");

  const calculateSavings = () => {
    if (!subPrice) return 0;
    return Math.round(((price - subPrice) / price) * 100);
  };

  const handleToggle = (val: string) => {
    setIsSubscription(val);
    const subscribe = val === "true";
    onSubscriptionChange(subscribe, subscribe ? frequency : "");
  };

  const handleFrequencyChange = (newFrequency: string | null) => {
    if (!newFrequency) return;
    setFrequency(newFrequency);
    if (isSubscription === "true") {
      onSubscriptionChange(true, newFrequency);
    }
  };

  return (
    <div className="space-y-6">
      <RadioGroup value={isSubscription} onValueChange={handleToggle} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Subscribe & Save Option */}
        <Label
          htmlFor="subscribe"
          className="cursor-pointer [&:has([data-state=checked])>div]:border-primary [&:has([data-state=checked])>div]:bg-primary/5"
        >
          <Card className="relative border-2 transition-all hover:border-primary/50 shadow-sm border-muted h-32">
            <CardContent className="p-4 flex flex-col h-full justify-between items-start">
               <div className="flex w-full justify-between items-start mb-2">
                 <RadioGroupItem value="true" id="subscribe" className="sr-only" />
                 <div className="w-5 h-5 rounded-full border border-primary flex items-center justify-center">
                   {isSubscription === "true" && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
                 </div>
                 <Badge variant="outline" className="border-primary text-primary font-medium bg-background">Save {calculateSavings()}%</Badge>
               </div>
               <div className="mt-2">
                 <p className="font-semibold text-sm mb-1 text-foreground">Subscribe & Save</p>
                 <p className="text-xl font-bold tracking-tight text-foreground">
                   ₹{subPrice ? (subPrice / 100).toFixed(2) : (price / 100).toFixed(2)} 
                   <span className="text-xs font-normal text-muted-foreground ml-2 line-through">₹{(price / 100).toFixed(2)}</span>
                 </p>
               </div>
            </CardContent>
          </Card>
        </Label>

        {/* One-time Purchase Option */}
        <Label
          htmlFor="onetime"
          className="cursor-pointer [&:has([data-state=checked])>div]:border-primary [&:has([data-state=checked])>div]:bg-primary/5"
        >
          <Card className="relative border-2 transition-all hover:border-primary/50 shadow-sm border-muted h-32">
            <CardContent className="p-4 flex flex-col h-full justify-between items-start">
               <div className="flex w-full justify-between items-start mb-2">
                 <RadioGroupItem value="false" id="onetime" className="sr-only" />
                 <div className="w-5 h-5 rounded-full border border-primary flex items-center justify-center">
                   {isSubscription === "false" && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
                 </div>
               </div>
               <div className="mt-2 text-left">
                 <p className="font-medium text-sm mb-1 text-foreground">One-time Purchase</p>
                 <p className="text-xl font-bold tracking-tight text-foreground">
                   ₹{(price / 100).toFixed(2)}
                 </p>
               </div>
            </CardContent>
          </Card>
        </Label>
      </RadioGroup>

      {/* Frequency Selector */}
      {isSubscription === "true" && (
        <div className="flex items-center space-x-4 bg-muted/30 p-4 rounded-lg border border-muted shadow-sm animate-in fade-in slide-in-from-top-2">
          <Label className="text-sm font-semibold text-foreground whitespace-nowrap">Deliver every:</Label>
          <Select value={frequency} onValueChange={handleFrequencyChange}>
            <SelectTrigger className="w-full bg-background border-muted hover:border-primary/30 transition-colors">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="FORTNIGHTLY">Fortnightly (Save 12%)</SelectItem>
              <SelectItem value="MONTHLY">Monthly (Save 15%)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
