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
    { label: "Weekly", value: "WEEKLY", description: "Fresh eggs every 7 days" },
    { label: "Fortnightly", value: "FORTNIGHTLY", description: "Fresh eggs every 14 days" },
    { label: "Monthly", value: "MONTHLY", description: "Fresh eggs every 28 days" },
  ];

  return (
    <div className="space-y-4 bg-muted/20 p-6 rounded-2xl border border-muted/50">
      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2 block">Choose Frequency</Label>
      <RadioGroup value={value} onValueChange={onValueChange} className="grid grid-cols-1 gap-3">
        {frequencies.map((freq) => (
          <Label
            key={freq.value}
            htmlFor={`freq-${freq.value}`}
            className={`flex items-center justify-between p-5 border-2 rounded-2xl cursor-pointer transition-all hover:bg-white group has-[:checked]:border-teal-600 has-[:checked]:bg-teal-50/50 has-[:checked]:shadow-md`}
          >
            <div className="flex items-center space-x-4">
              <RadioGroupItem value={freq.value} id={`freq-${freq.value}`} className="border-teal-600 text-teal-600" />
              <div className="space-y-0.5">
                <span className="font-black text-lg text-foreground block group-hover:text-teal-700 transition-colors">
                  {freq.label}
                </span>
                <p className="text-xs font-bold text-muted-foreground/80 leading-none">{freq.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-black text-xl text-teal-700">₹{(basePrice / 100).toFixed(2)}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">total</p>
            </div>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
}
