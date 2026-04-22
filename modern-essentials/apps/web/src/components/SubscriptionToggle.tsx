"use client";

import { useState } from "react";
import { 
  RadioGroup, 
  RadioGroupItem, 
  Label, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue, 
  Badge,
  Heading,
  Text,
  Card
} from "@modern-essentials/ui";
import { cn } from "@/lib/utils";

interface SubscriptionToggleProps {
  price: number;
  subPrice?: number;
  onSubscriptionChange: (isSubscription: boolean, frequency: string, durationMonths: number) => void;
}

export default function SubscriptionToggle({
  price,
  subPrice,
  onSubscriptionChange,
}: SubscriptionToggleProps) {
  const [isSubscription, setIsSubscription] = useState("true");
  const [frequency, setFrequency] = useState("WEEKLY");
  const [durationMonths, setDurationMonths] = useState(1);

  const calculateSavings = () => {
    if (!subPrice) return 0;
    return Math.round(((price - subPrice) / price) * 100);
  };

  const handleToggle = (val: string) => {
    setIsSubscription(val);
    const subscribe = val === "true";
    onSubscriptionChange(subscribe, subscribe ? frequency : "", subscribe ? durationMonths : 0);
  };

  const handleFrequencyChange = (newFrequency: string | null) => {
    if (!newFrequency) return;
    setFrequency(newFrequency);
    if (isSubscription === "true") {
      onSubscriptionChange(true, newFrequency, durationMonths);
    }
  };

  const handleDurationChange = (newDuration: string | null) => {
    if (!newDuration) return;
    const months = parseInt(newDuration);
    setDurationMonths(months);
    if (isSubscription === "true") {
      onSubscriptionChange(true, frequency, months);
    }
  };

  return (
    <div className="space-y-4">
      <RadioGroup value={isSubscription} onValueChange={handleToggle} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Subscribe & Save Option */}
        <div className="relative">
          <RadioGroupItem value="true" id="subscribe" className="peer sr-only" />
          <Label
            htmlFor="subscribe"
            className={cn(
              "flex flex-col h-28 justify-between items-start p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300",
              "peer-data-[state=checked]:border-secondary peer-data-[state=checked]:bg-surface peer-data-[state=checked]:shadow-md",
              "border-primary/5 bg-surface/30 hover:bg-surface/50"
            )}
          >
            <div className="flex w-full justify-between items-start">
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                isSubscription === "true" ? "border-secondary bg-secondary text-white" : "border-primary/10"
              )}>
                {isSubscription === "true" && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <Badge className="bg-secondary text-white font-black text-[9px] uppercase tracking-widest border-none px-2 py-0.5">Save {calculateSavings()}%</Badge>
            </div>
            <div className="space-y-0.5">
              <Text variant="xs" className="text-primary/40 font-black text-[10px]">Subscribe & Save</Text>
              <div className="flex items-baseline gap-2">
                <Heading variant="h3" className="text-xl text-primary tracking-tight font-bold">
                  ₹{subPrice ? (subPrice / 100).toFixed(2) : (price / 100).toFixed(2)}
                </Heading>
                <Text variant="small" className="text-primary/20 line-through text-xs font-bold">₹{(price / 100).toFixed(2)}</Text>
              </div>
            </div>
          </Label>
        </div>

        {/* One-time Purchase Option */}
        <div className="relative">
          <RadioGroupItem value="false" id="onetime" className="peer sr-only" />
          <Label
            htmlFor="onetime"
            className={cn(
              "flex flex-col h-28 justify-between items-start p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300",
              "peer-data-[state=checked]:border-secondary peer-data-[state=checked]:bg-surface peer-data-[state=checked]:shadow-md",
              "border-primary/5 bg-surface/30 hover:bg-surface/50"
            )}
          >
            <div className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
              isSubscription === "false" ? "border-secondary bg-secondary text-white" : "border-primary/10"
            )}>
              {isSubscription === "false" && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
            <div className="space-y-0.5">
              <Text variant="xs" className="text-primary/40 font-black text-[10px]">One-time Purchase</Text>
              <Heading variant="h3" className="text-xl text-primary tracking-tight font-bold">
                ₹{(price / 100).toFixed(2)}
              </Heading>
            </div>
          </Label>
        </div>
      </RadioGroup>

      {/* Frequency & Duration Selectors */}
      {isSubscription === "true" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
          <Card className="flex flex-col gap-2 bg-surface/50 p-4 rounded-2xl border-none shadow-inner">
            <Label className="text-[10px] uppercase tracking-widest font-black text-primary/40">Deliver every:</Label>
            <Select value={frequency} onValueChange={handleFrequencyChange}>
              <SelectTrigger className="w-full bg-surface border-none rounded-xl h-12 px-6 font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-white transition-colors">
                <SelectValue placeholder="Frequency" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-2xl p-1">
                <SelectItem value="WEEKLY" className="text-[10px] uppercase tracking-widest font-black py-3 rounded-lg">Weekly</SelectItem>
                <SelectItem value="FORTNIGHTLY" className="text-[10px] uppercase tracking-widest font-black py-3 rounded-lg">Fortnightly</SelectItem>
                <SelectItem value="MONTHLY" className="text-[10px] uppercase tracking-widest font-black py-3 rounded-lg">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          <Card className="flex flex-col gap-2 bg-surface/50 p-4 rounded-2xl border-none shadow-inner">
            <Label className="text-[10px] uppercase tracking-widest font-black text-primary/40">Plan Duration:</Label>
            <Select value={durationMonths.toString()} onValueChange={handleDurationChange}>
              <SelectTrigger className="w-full bg-surface border-none rounded-xl h-12 px-6 font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-white transition-colors">
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-2xl p-1">
                <SelectItem value="1" className="text-[10px] uppercase tracking-widest font-black py-3 rounded-lg">1 Month</SelectItem>
                <SelectItem value="2" className="text-[10px] uppercase tracking-widest font-black py-3 rounded-lg">2 Months</SelectItem>
                <SelectItem value="3" className="text-[10px] uppercase tracking-widest font-black py-3 rounded-lg">3 Months</SelectItem>
              </SelectContent>
            </Select>
          </Card>
        </div>
      )}
    </div>
  );
}
