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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-base font-semibold">Quantity</Label>
        <div className="text-right">
          <p className="font-bold text-teal-700">₹{((pricePerUnit * value) / 100).toFixed(2)}</p>
          <p className="text-[10px] text-muted-foreground">total per delivery</p>
        </div>
      </div>
      <div className="flex items-center justify-between border rounded-lg p-2 bg-gray-50">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full bg-white shadow-sm"
          onClick={decrement}
          disabled={value <= min}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <span className="text-2xl font-bold">{value}</span>
          <span className="text-sm text-muted-foreground ml-1">Eggs</span>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full bg-white shadow-sm"
          onClick={increment}
          disabled={value >= max}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Recommended: {value >= 24 ? "Large Family" : value >= 12 ? "Regular Family" : "Single / Couple"}
      </p>
    </div>
  );
}
