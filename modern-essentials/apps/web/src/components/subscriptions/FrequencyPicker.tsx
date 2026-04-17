"use client";

import { RadioGroup, RadioGroupItem, Label, Heading, Text, Card } from "@modern-essentials/ui";
import { cn } from "@/lib/utils";

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
    <Card className="space-y-6 bg-primary/5 p-8 rounded-[32px] border-none shadow-inner">
      <Text variant="xs" className="font-black uppercase tracking-[0.2em] text-primary/40 block">Choose Frequency</Text>
      <RadioGroup value={value} onValueChange={onValueChange} className="grid grid-cols-1 gap-4">
        {frequencies.map((freq) => (
          <div key={freq.value} className="relative">
            <RadioGroupItem value={freq.value} id={`freq-${freq.value}`} className="peer sr-only" />
            <Label
              htmlFor={`freq-${freq.value}`}
              className={cn(
                "flex items-center justify-between p-6 border-2 rounded-[24px] cursor-pointer transition-all duration-300",
                "peer-data-[state=checked]:border-secondary peer-data-[state=checked]:bg-surface peer-data-[state=checked]:shadow-md",
                "border-primary/5 bg-surface/50 hover:bg-surface"
              )}
            >
              <div className="flex items-center space-x-4">
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                  value === freq.value ? "border-secondary bg-secondary text-white" : "border-primary/10"
                )}>
                  {value === freq.value && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                </div>
                <div className="space-y-1">
                  <Heading variant="h4" className="text-lg text-primary block">
                    {freq.label}
                  </Heading>
                  <Text variant="xs" className="text-primary/40 font-bold leading-none">{freq.description}</Text>
                </div>
              </div>
              <div className="text-right space-y-1">
                <Heading variant="h3" className="text-xl text-secondary tracking-tight">₹{(basePrice / 100).toFixed(2)}</Heading>
                <Text variant="xs" className="text-primary/20 font-black uppercase tracking-widest text-[9px]">total</Text>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </Card>
  );
}
