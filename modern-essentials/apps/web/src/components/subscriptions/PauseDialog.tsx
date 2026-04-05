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
  subscriptionId: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (durationWeeks: number) => Promise<void>;
}

export function PauseDialog({ subscriptionId, isOpen, onClose, onConfirm }: PauseDialogProps) {
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
      <DialogContent className="sm:max-w-[450px] p-8 rounded-3xl border-none shadow-2xl !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2">
        <DialogHeader>
          <div className="bg-teal-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border border-teal-100">
            <Clock className="text-teal-600 h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-foreground">Pause Subscription</DialogTitle>
          <DialogDescription className="text-base pt-1 leading-relaxed">
            Taking a break? You can pause for up to 4 weeks. 
            Deliveries will resume automatically.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-8">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-4 block">Select duration</Label>
          <RadioGroup value={duration} onValueChange={setDuration} className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((weeks) => (
              <Label
                key={weeks}
                htmlFor={`weeks-${weeks}`}
                className="flex items-center space-x-3 border-2 rounded-2xl p-4 cursor-pointer hover:bg-muted/30 transition-all has-[:checked]:border-teal-600 has-[:checked]:bg-teal-50/50"
              >
                <RadioGroupItem value={weeks.toString()} id={`weeks-${weeks}`} className="border-teal-600 text-teal-600" />
                <span className="font-bold text-lg text-foreground">
                  {weeks} {weeks === 1 ? "Week" : "Weeks"}
                </span>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-3">
          <Button className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white font-black text-lg rounded-2xl shadow-lg shadow-teal-600/20 transition-all active:scale-[0.98]" onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Confirm Pause"}
          </Button>
          <Button variant="ghost" className="w-full h-12 text-muted-foreground font-bold hover:bg-muted/50 rounded-2xl" onClick={onClose} disabled={isSubmitting}>
            Go Back
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
