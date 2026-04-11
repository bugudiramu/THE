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
} from "@modern-essentials/ui";
import { Clock } from "lucide-react";

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
      <DialogContent className="sm:max-w-[450px] p-10 rounded-xl border-none shadow-[0px_20px_40px_rgba(6,27,14,0.15)] bg-surface !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2">
        <DialogHeader>
          <div className="bg-primary/5 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
            <Clock className="text-primary h-7 w-7" />
          </div>
          <DialogTitle className="text-3xl font-headline font-bold tracking-tight text-primary">Pause Subscription</DialogTitle>
          <DialogDescription className="text-lg pt-2 leading-relaxed text-primary/60">
            Taking a break? You can pause for up to 4 weeks. 
            Deliveries will resume automatically.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-10">
          <Label className="text-xs font-bold uppercase tracking-[0.2em] text-primary/40 mb-6 block">Select duration</Label>
          <RadioGroup value={duration} onValueChange={setDuration} className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((weeks) => (
              <Label
                key={weeks}
                htmlFor={`weeks-${weeks}`}
                className="flex items-center space-x-3 bg-surface-container-low rounded-xl p-5 cursor-pointer hover:bg-primary/5 transition-all has-[:checked]:bg-secondary/10 has-[:checked]:text-secondary"
              >
                <RadioGroupItem value={weeks.toString()} id={`weeks-${weeks}`} className="border-secondary text-secondary" />
                <span className="font-bold text-xl">
                  {weeks} {weeks === 1 ? "Week" : "Weeks"}
                </span>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-4">
          <Button className="w-full h-14 bg-secondary hover:brightness-110 text-white font-bold text-lg rounded-xl shadow-lg shadow-secondary/20 transition-all active:scale-[0.98]" onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Confirm Pause"}
          </Button>
          <Button variant="ghost" className="w-full h-12 text-primary/40 font-bold hover:bg-primary/5 rounded-xl transition-colors" onClick={onClose} disabled={isSubmitting}>
            Go Back
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
