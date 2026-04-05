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
} from "@modern-essentials/ui";
import { format } from "date-fns";
import { SkipForward } from "lucide-react";

interface SkipDialogProps {
  subscriptionId: string;
  nextDeliveryDate: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function SkipDialog({ subscriptionId, nextDeliveryDate, isOpen, onClose, onConfirm }: SkipDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
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
            <SkipForward className="text-teal-600 h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-foreground">Skip Next Delivery</DialogTitle>
          <DialogDescription className="text-base pt-1 leading-relaxed">
            Are you sure you want to skip your next delivery scheduled for{" "}
            <span className="font-bold text-teal-700">
              {format(new Date(nextDeliveryDate), "MMMM d, yyyy")}
            </span>?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 text-sm text-muted-foreground leading-relaxed">
          Your next delivery after this will be scheduled as per your normal frequency. 
          You won't be charged for the skipped delivery.
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-3">
          <Button className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-lg transition-all active:scale-[0.98]" onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Confirm Skip"}
          </Button>
          <Button variant="ghost" className="w-full h-12 text-muted-foreground font-bold hover:bg-muted/50 rounded-2xl" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
