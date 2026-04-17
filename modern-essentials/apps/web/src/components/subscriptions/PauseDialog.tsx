"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  RadioGroup,
  RadioGroupItem,
  Label,
  Heading,
  Text
} from "@modern-essentials/ui";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PauseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (durationWeeks: number) => Promise<void>;
}

export function PauseDialog({ isOpen, onClose, onConfirm }: PauseDialogProps) {
  const [duration, setDuration] = useState("2");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(parseInt(duration));
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-12 rounded-[40px] border-none shadow-2xl bg-surface !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2">
        <DialogHeader className="text-left space-y-6">
          <div className="bg-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner">
            <Clock className="text-secondary h-8 w-8" />
          </div>
          <div className="space-y-3">
            <DialogTitle>
              <Heading variant="h2" className="tracking-tighter text-primary">Pause Subscription</Heading>
            </DialogTitle>
            <DialogDescription asChild>
              <Text variant="lead" className="text-primary/60 font-medium leading-relaxed">
                Taking a break? You can pause for up to 4 weeks. 
                Deliveries will resume automatically.
              </Text>
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <div className="py-12 space-y-6">
          <Text variant="xs" className="font-black uppercase tracking-[0.2em] text-primary/30 block">Select duration</Text>
          <RadioGroup value={duration} onValueChange={setDuration} className="grid grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((weeks) => (
              <div key={weeks} className="relative">
                <RadioGroupItem value={weeks.toString()} id={`weeks-${weeks}`} className="peer sr-only" />
                <Label
                  htmlFor={`weeks-${weeks}`}
                  className={cn(
                    "flex items-center space-x-4 p-6 bg-surface-container-low rounded-[24px] border-2 cursor-pointer transition-all duration-300",
                    "peer-data-[state=checked]:border-secondary peer-data-[state=checked]:bg-surface peer-data-[state=checked]:shadow-md",
                    "border-primary/5 hover:bg-surface"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                    duration === weeks.toString() ? "border-secondary bg-secondary text-white" : "border-primary/10"
                  )}>
                    {duration === weeks.toString() && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                  </div>
                  <Heading variant="h4" className="text-xl text-primary block">
                    {weeks} {weeks === 1 ? "Week" : "Weeks"}
                  </Heading>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-4 pt-4">
          <Button size="lg" className="w-full h-16 bg-secondary hover:brightness-110 text-white font-bold rounded-2xl shadow-xl transition-all active:scale-[0.98]" onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Confirm Pause"}
          </Button>
          <Button variant="ghost" className="w-full h-12 text-primary/30 font-bold hover:bg-primary/5 rounded-xl transition-colors h-auto py-2" onClick={onClose} disabled={isSubmitting}>
            Go Back
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
