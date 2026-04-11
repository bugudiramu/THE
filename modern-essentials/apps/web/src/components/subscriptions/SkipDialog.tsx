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
  nextDeliveryDate: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function SkipDialog({ nextDeliveryDate, isOpen, onClose, onConfirm }: SkipDialogProps) {
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
      <DialogContent className="sm:max-w-[450px] p-10 rounded-xl border-none shadow-[0px_20px_40px_rgba(6,27,14,0.15)] bg-surface !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2">
        <DialogHeader>
          <div className="bg-primary/5 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
            <SkipForward className="text-primary h-7 w-7" />
          </div>
          <DialogTitle className="text-3xl font-headline font-bold tracking-tight text-primary">Skip Next Delivery</DialogTitle>
          <DialogDescription className="text-lg pt-2 leading-relaxed text-primary/60">
            Are you sure you want to skip your next delivery scheduled for{" "}
            <span className="font-bold text-primary">
              {format(new Date(nextDeliveryDate), "MMMM d, yyyy")}
            </span>?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-8 text-base text-primary/50 leading-relaxed font-medium">
          Your next delivery after this will be scheduled as per your normal frequency. 
          You won't be charged for the skipped delivery.
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-4">
          <Button className="w-full h-14 bg-secondary hover:brightness-110 text-white font-bold text-lg rounded-xl shadow-lg shadow-secondary/20 transition-all active:scale-[0.98]" onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Confirm Skip"}
          </Button>
          <Button variant="ghost" className="w-full h-12 text-primary/40 font-bold hover:bg-primary/5 rounded-xl transition-colors" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
