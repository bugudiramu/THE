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
import { AlertTriangle, CheckCircle2, Gift } from "lucide-react";

interface CancelFlowProps {
  subscription: {
    id: string;
    productName: string;
    totalDeliveries?: number;
    totalSavings?: number;
  };
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  onPauseInstead: () => void;
}

export function CancelFlow({ subscription, isOpen, onClose, onConfirm, onPauseInstead }: CancelFlowProps) {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons = [
    "Too expensive",
    "Quality issue",
    "Too many eggs",
    "Switching brand",
    "Other",
  ];

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleCancel = async () => {
    if (!reason) return;
    setIsSubmitting(true);
    try {
      await onConfirm(reason);
      setStep(5); // Success step
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <DialogHeader>
              <DialogTitle>Wait! Look at what you've achieved</DialogTitle>
              <DialogDescription>
                You're part of the radical transparency movement.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-6">
              <div className="bg-teal-50 p-4 rounded-lg flex items-start space-x-3">
                <Gift className="h-6 w-6 text-teal-600 mt-1" />
                <div>
                  <p className="font-semibold text-teal-900">
                    You've received {subscription.totalDeliveries || 8} deliveries!
                  </p>
                  <p className="text-sm text-teal-700">
                    That's approximately {(subscription.totalDeliveries || 8) * 6} fresh eggs delivered straight from the farm.
                  </p>
                </div>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg flex items-start space-x-3">
                <CheckCircle2 className="h-6 w-6 text-amber-600 mt-1" />
                <div>
                  <p className="font-semibold text-amber-900">
                    You've saved ₹{subscription.totalSavings || 450}!
                  </p>
                  <p className="text-sm text-amber-700">
                    By subscribing, you enjoy our best prices and priority inventory.
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Keep Subscription
              </Button>
              <Button onClick={handleNext}>Continue to Cancel</Button>
            </DialogFooter>
          </>
        );
      case 2:
        return (
          <>
            <DialogHeader>
              <DialogTitle>Need a break instead?</DialogTitle>
              <DialogDescription>
                Most of our customers prefer pausing when they're away or have too much stock.
              </DialogDescription>
            </DialogHeader>
            <div className="py-8 text-center">
              <p className="text-gray-600 mb-6">
                You can pause for 1-4 weeks and we'll automatically resume when you're ready.
              </p>
              <Button variant="outline" className="w-full py-6 text-lg border-teal-600 text-teal-700 hover:bg-teal-50" onClick={onPauseInstead}>
                Pause Subscription Instead
              </Button>
            </div>
            <DialogFooter className="flex justify-between sm:justify-between">
              <Button variant="ghost" onClick={handleBack}>Back</Button>
              <Button variant="link" onClick={handleNext} className="text-muted-foreground">
                No, I still want to cancel
              </Button>
            </DialogFooter>
          </>
        );
      case 3:
        return (
          <>
            <DialogHeader>
              <DialogTitle>Why are you leaving?</DialogTitle>
              <DialogDescription>
                Your feedback helps us improve our service for everyone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <RadioGroup value={reason} onValueChange={setReason} className="space-y-3">
                {reasons.map((r) => (
                  <div key={r} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value={r} id={`reason-${r}`} />
                    <Label htmlFor={`reason-${r}`} className="flex-1 cursor-pointer">{r}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={handleBack}>Back</Button>
              <Button onClick={handleNext} disabled={!reason}>Next</Button>
            </DialogFooter>
          </>
        );
      case 4:
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-red-600">Final Confirmation</DialogTitle>
              <DialogDescription>
                This will cancel your recurring delivery and you'll lose your subscription discount.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 flex flex-col items-center text-center">
              <div className="bg-red-50 p-4 rounded-full mb-4">
                <AlertTriangle className="h-12 w-12 text-red-600" />
              </div>
              <p className="text-gray-700 font-medium">
                Are you absolutely sure you want to cancel your {subscription.productName} subscription?
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                No, Keep It
              </Button>
              <Button variant="destructive" onClick={handleCancel} disabled={isSubmitting}>
                {isSubmitting ? "Cancelling..." : "Yes, Cancel Subscription"}
              </Button>
            </DialogFooter>
          </>
        );
      case 5:
        return (
          <>
            <DialogHeader>
              <DialogTitle>Subscription Cancelled</DialogTitle>
              <DialogDescription>
                We're sorry to see you go.
              </DialogDescription>
            </DialogHeader>
            <div className="py-8 text-center">
              <div className="bg-green-50 p-4 rounded-full inline-block mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <p className="text-gray-600">
                Your subscription has been cancelled successfully. You can reactivate it anytime from your account.
              </p>
            </div>
            <DialogFooter>
              <Button className="w-full" onClick={onClose}>Done</Button>
            </DialogFooter>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}
