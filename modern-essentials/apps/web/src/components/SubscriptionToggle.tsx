"use client";

import { useState } from "react";
import { RadioGroup, RadioGroupItem, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge } from "@modern-essentials/ui";
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
          className="cursor-pointer"
        >
          <div className={`relative transition-all h-36 rounded-3xl p-6 flex flex-col justify-between items-start ${isSubscription === "true" ? "bg-surface shadow-sm" : "bg-surface/30 opacity-70 hover:opacity-100"}`}>
               <div className="flex w-full justify-between items-start mb-2">
                 <RadioGroupItem value="true" id="subscribe" className="sr-only" />
                 <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${isSubscription === "true" ? "border-secondary" : "border-on-surface/20"}`}>
                   {isSubscription === "true" && <div className="w-3 h-3 bg-secondary rounded-full"></div>}
                 </div>
                 <Badge className="bg-secondary text-white font-bold text-[10px] uppercase tracking-widest border-none">Save {calculateSavings()}%</Badge>
               </div>
               <div className="mt-auto">
                 <p className="font-bold text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Subscribe & Save</p>
                 <p className="text-xl font-bold tracking-tight text-on-surface font-body">
                   Rs. {subPrice ? (subPrice / 100).toFixed(2) : (price / 100).toFixed(2)}
                   <span className="text-xs font-normal text-on-surface-variant ml-2 line-through opacity-50">Rs. {(price / 100).toFixed(2)}</span>
                 </p>
               </div>
          </div>
        </Label>

        {/* One-time Purchase Option */}
        <Label
          htmlFor="onetime"
          className="cursor-pointer"
        >
          <div className={`relative transition-all h-36 rounded-3xl p-6 flex flex-col justify-between items-start ${isSubscription === "false" ? "bg-surface shadow-sm" : "bg-surface/30 opacity-70 hover:opacity-100"}`}>
               <div className="flex w-full justify-between items-start mb-2">
                 <RadioGroupItem value="false" id="onetime" className="sr-only" />
                 <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${isSubscription === "false" ? "border-secondary" : "border-on-surface/20"}`}>
                   {isSubscription === "false" && <div className="w-3 h-3 bg-secondary rounded-full"></div>}
                 </div>
               </div>
               <div className="mt-auto text-left">
                 <p className="font-bold text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">One-time Purchase</p>
                 <p className="text-xl font-bold tracking-tight text-on-surface font-body">
                   Rs. {(price / 100).toFixed(2)}
                 </p>
               </div>
          </div>
        </Label>
      </RadioGroup>

      {/* Frequency Selector */}
      {isSubscription === "true" && (
        <div className="flex items-center space-x-6 bg-surface/50 p-6 rounded-3xl animate-in fade-in slide-in-from-top-2">
          <Label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant whitespace-nowrap">Deliver every:</Label>
          <Select value={frequency} onValueChange={handleFrequencyChange}>
            <SelectTrigger className="w-full bg-surface border-none rounded-full h-12 px-6 font-bold text-xs uppercase tracking-widest shadow-sm">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-xl">
              <SelectItem value="WEEKLY" className="text-xs uppercase tracking-widest font-bold">Weekly</SelectItem>
              <SelectItem value="FORTNIGHTLY" className="text-xs uppercase tracking-widest font-bold">Fortnightly</SelectItem>
              <SelectItem value="MONTHLY" className="text-xs uppercase tracking-widest font-bold">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
