"use client";

import { Button } from "@modern-essentials/ui";
import { Label } from "@modern-essentials/ui";
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
    <div className="space-y-6 bg-muted/20 p-6 rounded-2xl border border-muted/50">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Select Quantity</Label>
          <p className="text-sm font-bold text-foreground">Adjust your delivery size</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-teal-700">₹{((pricePerUnit * value) / 100).toFixed(2)}</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">per delivery</p>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white border-2 border-muted p-2 rounded-2xl shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-xl bg-muted/10 hover:bg-teal-50 hover:text-teal-600 transition-colors"
          onClick={decrement}
          disabled={value <= min}
        >
          <Minus className="h-5 w-5" />
        </Button>
        
        <div className="flex flex-col items-center">
          <span className="text-3xl font-black text-foreground tabular-nums">{value}</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Eggs</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-xl bg-muted/10 hover:bg-teal-50 hover:text-teal-600 transition-colors"
          onClick={increment}
          disabled={value >= max}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      <div className="bg-white/50 p-3 rounded-xl border border-dashed text-center">
        <p className="text-xs font-bold text-muted-foreground">
          Recommended for: <span className="text-foreground">{value >= 24 ? "Large Family (4+ people)" : value >= 12 ? "Regular Family (2-3 people)" : "Individuals / Couples"}</span>
        </p>
      </div>
    </div>
  );
}
