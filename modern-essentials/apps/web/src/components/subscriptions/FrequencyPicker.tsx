"use client";

import { RadioGroup, RadioGroupItem } from "@modern-essentials/ui";
import { Label } from "@modern-essentials/ui";

interface FrequencyPickerProps {
  value: string;
  onValueChange: (value: string) => void;
  basePrice: number;
}

export function FrequencyPicker({ value, onValueChange, basePrice }: FrequencyPickerProps) {
  const frequencies = [
    { label: "Weekly", value: "WEEKLY", description: "Every week" },
    { label: "Fortnightly", value: "FORTNIGHTLY", description: "Every 2 weeks" },
    { label: "Monthly", value: "MONTHLY", description: "Every 4 weeks" },
  ];

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Delivery Frequency</Label>
      <RadioGroup value={value} onValueChange={onValueChange} className="grid grid-cols-1 gap-3">
        {frequencies.map((freq) => (
          <div
            key={freq.value}
            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
              value === freq.value ? "border-teal-600 bg-teal-50" : "hover:bg-gray-50"
            }`}
            onClick={() => onValueChange(freq.value)}
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value={freq.value} id={`freq-${freq.value}`} />
              <div>
                <Label htmlFor={`freq-${freq.value}`} className="font-semibold cursor-pointer">
                  {freq.label}
                </Label>
                <p className="text-xs text-muted-foreground">{freq.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-teal-700">₹{(basePrice / 100).toFixed(2)}</p>
              <p className="text-[10px] text-muted-foreground">per delivery</p>
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
