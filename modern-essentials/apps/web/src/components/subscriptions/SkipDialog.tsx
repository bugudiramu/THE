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
import { format } from "date-fns";

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Skip Next Delivery</DialogTitle>
          <DialogDescription>
            Are you sure you want to skip your next delivery scheduled for{" "}
            <span className="font-semibold text-gray-900">
              {format(new Date(nextDeliveryDate), "MMMM d, yyyy")}
            </span>?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 text-sm text-muted-foreground">
          Your next delivery after this will be scheduled as per your normal frequency. 
          You won't be charged for the skipped delivery.
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Skipping..." : "Confirm Skip"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
