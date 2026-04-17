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
  Heading,
  Text,
  Card
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
      <DialogContent className="sm:max-w-[500px] p-12 rounded-[40px] border-none shadow-2xl bg-surface !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2">
        <DialogHeader className="text-left space-y-6">
          <div className="bg-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner">
            <SkipForward className="text-secondary h-8 w-8" />
          </div>
          <div className="space-y-3">
            <DialogTitle>
              <Heading variant="h2" className="tracking-tighter text-primary">Skip Next Delivery</Heading>
            </DialogTitle>
            <DialogDescription asChild>
              <Text variant="lead" className="text-primary/60 font-medium leading-relaxed">
                Are you sure you want to skip your next delivery scheduled for{" "}
                <span className="text-primary font-bold">
                  {format(new Date(nextDeliveryDate), "MMMM d, yyyy")}
                </span>?
              </Text>
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <Card className="my-10 bg-primary/5 p-8 rounded-[32px] border-none shadow-inner">
          <Text className="text-primary/60 font-medium leading-relaxed italic">
            Your next delivery after this will be scheduled as per your normal frequency. 
            You won't be charged for the skipped delivery.
          </Text>
        </Card>

        <DialogFooter className="flex-col sm:flex-col gap-4">
          <Button size="lg" className="w-full h-16 bg-secondary hover:brightness-110 text-white font-bold rounded-2xl shadow-xl transition-all active:scale-[0.98]" onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Confirm Skip"}
          </Button>
          <Button variant="ghost" className="w-full h-12 text-primary/30 font-bold hover:bg-primary/5 rounded-xl transition-colors h-auto py-2" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
