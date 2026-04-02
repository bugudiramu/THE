"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@modern-essentials/ui";
import { Button } from "@modern-essentials/ui";
import { RadioGroup, RadioGroupItem } from "@modern-essentials/ui";
import { Label } from "@modern-essentials/ui";

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pause Subscription</DialogTitle>
          <DialogDescription>
            Taking a break? You can pause your subscription for up to 4 weeks. 
            Billing and deliveries will resume automatically after the selected period.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          <Label className="text-base font-semibold mb-4 block">Pause duration</Label>
          <RadioGroup value={duration} onValueChange={setDuration} className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((weeks) => (
              <div key={weeks} className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value={weeks.toString()} id={`pause-${weeks}`} />
                <Label htmlFor={`pause-${weeks}`} className="cursor-pointer">
                  {weeks} {weeks === 1 ? "Week" : "Weeks"}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Pausing..." : "Confirm Pause"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
