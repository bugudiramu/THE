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
import { AlertTriangle, CheckCircle2, Gift, ArrowRight, ArrowLeft } from "lucide-react";

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
      setStep(5); 
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
              <DialogTitle className="text-2xl font-black">Wait! Look at what you've achieved</DialogTitle>
              <DialogDescription className="text-base">
                You're part of the radical transparency movement.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-4">
              <div className="bg-teal-50 p-5 rounded-2xl flex items-start space-x-4 border border-teal-100">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <Gift className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <p className="font-bold text-teal-900">
                    {subscription.totalDeliveries || 8} Deliveries Received
                  </p>
                  <p className="text-sm text-teal-700/80">
                    That's approx {(subscription.totalDeliveries || 8) * 6} farm-fresh eggs delivered to your door.
                  </p>
                </div>
              </div>
              <div className="bg-orange-50 p-5 rounded-2xl flex items-start space-x-4 border border-orange-100">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <CheckCircle2 className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="font-bold text-orange-900">
                    ₹{subscription.totalSavings || 450} Saved
                  </p>
                  <p className="text-sm text-orange-700/80">
                    Subscribers always get our best price and priority inventory access.
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-col gap-2">
              <Button className="w-full h-12 text-white font-bold" onClick={onClose}>
                Keep My Subscription
              </Button>
              <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleNext}>
                Continue to Cancel
              </Button>
            </DialogFooter>
          </>
        );
      case 2:
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Need a break instead?</DialogTitle>
              <DialogDescription className="text-base">
                Most customers prefer pausing when they're away or have too much stock.
              </DialogDescription>
            </DialogHeader>
            <div className="py-8 space-y-6">
              <div className="text-center p-6 bg-muted/30 rounded-2xl border border-dashed">
                <p className="text-muted-foreground mb-6">
                  Pause for 1-4 weeks and we'll automatically resume when you're ready. No reactivation needed.
                </p>
                <Button variant="outline" className="w-full h-12 border-teal-600 text-teal-700 hover:bg-teal-50 font-bold" onClick={onPauseInstead}>
                  Pause Subscription Instead
                </Button>
              </div>
            </div>
            <DialogFooter className="justify-between items-center">
              <Button variant="ghost" onClick={handleBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button variant="link" onClick={handleNext} className="text-muted-foreground underline">
                No, I still want to cancel
              </Button>
            </DialogFooter>
          </>
        );
      case 3:
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Why are you leaving?</DialogTitle>
              <DialogDescription>
                Help us improve the movement.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <RadioGroup value={reason} onValueChange={setReason} className="space-y-3">
                {reasons.map((r) => (
                  <div key={r} className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-muted/30 cursor-pointer transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <RadioGroupItem value={r} id={`reason-${r}`} />
                    <Label htmlFor={`reason-${r}`} className="flex-1 cursor-pointer font-bold">{r}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={handleBack} className="flex-1 h-12">Back</Button>
              <Button onClick={handleNext} disabled={!reason} className="flex-1 h-12 text-white font-bold">Next</Button>
            </DialogFooter>
          </>
        );
      case 4:
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-destructive">Final Confirmation</DialogTitle>
              <DialogDescription>
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-8 flex flex-col items-center text-center">
              <div className="bg-destructive/10 p-6 rounded-full mb-6">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <p className="text-foreground font-bold text-lg leading-tight">
                Are you absolutely sure you want to cancel your {subscription.productName} subscription?
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                You will lose your 15% subscriber discount immediately.
              </p>
            </div>
            <DialogFooter className="flex-col sm:flex-col gap-2">
              <Button variant="destructive" className="w-full h-12 font-bold" onClick={handleCancel} disabled={isSubmitting}>
                {isSubmitting ? "Cancelling..." : "Yes, Cancel Subscription"}
              </Button>
              <Button variant="outline" className="w-full h-12" onClick={onClose} disabled={isSubmitting}>
                No, Keep It
              </Button>
            </DialogFooter>
          </>
        );
      case 5:
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Subscription Cancelled</DialogTitle>
            </DialogHeader>
            <div className="py-10 text-center">
              <div className="bg-teal-50 p-6 rounded-full inline-block mb-6">
                <CheckCircle2 className="h-12 w-12 text-teal-600" />
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-[280px] mx-auto">
                Your subscription has been cancelled. You can reactivate it anytime from your dashboard.
              </p>
            </div>
            <DialogFooter>
              <Button className="w-full h-12 text-white font-bold" onClick={onClose}>Done</Button>
            </DialogFooter>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-8 rounded-3xl border-none shadow-2xl !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2">
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}
