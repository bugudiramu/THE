"use client";

import { Button, Heading, Text, Card } from "@modern-essentials/ui";
import { Minus, Plus } from "lucide-react";

interface QuantityPickerProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  pricePerUnit: number;
}

export function QuantityPicker({
  value,
  onValueChange,
  min = 6,
  max = 60,
  step = 6,
  pricePerUnit,
}: QuantityPickerProps) {
  const increment = () => {
    if (value + step <= max) {
      onValueChange(value + step);
    }
  };

  const decrement = () => {
    if (value - step >= min) {
      onValueChange(value - step);
    }
  };

  return (
    <Card className="space-y-8 bg-primary/5 p-8 rounded-[32px] border-none shadow-inner">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <Text variant="xs" className="font-black uppercase tracking-[0.2em] text-primary/40 block">Select Quantity</Text>
          <Heading variant="h4" className="text-primary">Adjust your delivery size</Heading>
        </div>
        <div className="text-right space-y-1">
          <Heading variant="h3" className="text-2xl text-secondary tracking-tight">₹{((pricePerUnit * value) / 100).toFixed(2)}</Heading>
          <Text variant="xs" className="text-primary/20 font-black uppercase tracking-widest text-[9px]">per delivery</Text>
        </div>
      </div>

      <div className="flex items-center justify-between bg-surface border-2 border-primary/5 p-3 rounded-3xl shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          className="h-14 w-14 rounded-2xl bg-primary/5 hover:bg-secondary/10 hover:text-secondary transition-all"
          onClick={decrement}
          disabled={value <= min}
        >
          <Minus className="h-6 w-6" />
        </Button>
        
        <div className="flex flex-col items-center">
          <Heading variant="h1" className="text-4xl text-primary tabular-nums">{value}</Heading>
          <Text variant="xs" className="text-primary/30 font-black uppercase tracking-widest text-[10px]">Units</Text>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-14 w-14 rounded-2xl bg-primary/5 hover:bg-secondary/10 hover:text-secondary transition-all"
          onClick={increment}
          disabled={value >= max}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <Card className="bg-surface/50 p-4 rounded-2xl border border-dashed border-primary/10 text-center">
        <Text variant="xs" className="text-primary/40 font-bold uppercase tracking-wider">
          Best for: <span className="text-primary">{value >= 24 ? "Large Family (4+ people)" : value >= 12 ? "Regular Family (2-3 people)" : "Individuals / Couples"}</span>
        </Text>
      </Card>
    </Card>
  );
}
