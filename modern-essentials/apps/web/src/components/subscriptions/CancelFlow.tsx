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
import { AlertTriangle, CheckCircle2, Gift, ArrowLeft } from "lucide-react";

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
              <DialogTitle className="text-3xl font-headline font-bold text-primary">Wait! Look at what you've achieved</DialogTitle>
              <DialogDescription className="text-lg pt-2 text-primary/60">
                You're part of the radical transparency movement.
              </DialogDescription>
            </DialogHeader>
            <div className="py-10 space-y-6">
              <div className="bg-primary/5 p-6 rounded-xl flex items-start space-x-6 border-none shadow-sm">
                <div className="bg-white p-3 rounded-xl shadow-sm">
                  <Gift className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-primary text-lg">
                    {subscription.totalDeliveries || 8} Deliveries Received
                  </p>
                  <p className="text-sm text-primary/50 font-medium leading-relaxed mt-1">
                    That's approx {(subscription.totalDeliveries || 8) * 6} farm-fresh eggs delivered to your door.
                  </p>
                </div>
              </div>
              <div className="bg-secondary/5 p-6 rounded-xl flex items-start space-x-6 border-none shadow-sm">
                <div className="bg-white p-3 rounded-xl shadow-sm">
                  <CheckCircle2 className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="font-bold text-secondary text-lg">
                    ₹{subscription.totalSavings || 450} Saved
                  </p>
                  <p className="text-sm text-secondary/70 font-medium leading-relaxed mt-1">
                    Subscribers always get our best price and priority inventory access.
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-col gap-4">
              <Button className="w-full h-14 bg-secondary hover:brightness-110 text-white font-bold text-lg rounded-xl shadow-lg shadow-secondary/20 transition-all" onClick={onClose}>
                Keep My Subscription
              </Button>
              <Button variant="ghost" className="w-full h-12 text-primary/40 font-bold hover:bg-primary/5 rounded-xl transition-colors" onClick={handleNext}>
                Continue to Cancel
              </Button>
            </DialogFooter>
          </>
        );
      case 2:
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-3xl font-headline font-bold text-primary">Need a break instead?</DialogTitle>
              <DialogDescription className="text-lg pt-2 text-primary/60">
                Most customers prefer pausing when they're away or have too much stock.
              </DialogDescription>
            </DialogHeader>
            <div className="py-10">
              <div className="text-center p-8 bg-surface-container-low rounded-xl border-none shadow-[0px_20px_40px_rgba(6,27,14,0.04)]">
                <p className="text-primary/60 font-medium mb-8 leading-relaxed">
                  Pause for 1-4 weeks and we'll automatically resume when you're ready. No reactivation needed.
                </p>
                <Button className="w-full h-14 bg-primary text-white hover:brightness-110 font-bold rounded-xl shadow-lg transition-all" onClick={onPauseInstead}>
                  Pause Subscription Instead
                </Button>
              </div>
            </div>
            <DialogFooter className="justify-between items-center pt-4">
              <Button variant="ghost" onClick={handleBack} className="gap-3 text-primary/40 font-bold hover:bg-primary/5 rounded-xl">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button variant="link" onClick={handleNext} className="text-primary/30 hover:text-primary/60 underline decoration-primary/20 font-bold">
                No, I still want to cancel
              </Button>
            </DialogFooter>
          </>
        );
      case 3:
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-3xl font-headline font-bold text-primary">Why are you leaving?</DialogTitle>
              <DialogDescription className="text-lg pt-2 text-primary/60">
                Help us improve the movement.
              </DialogDescription>
            </DialogHeader>
            <div className="py-10">
              <RadioGroup value={reason} onValueChange={setReason} className="space-y-4">
                {reasons.map((r) => (
                  <div key={r} className="flex items-center space-x-4 p-5 bg-surface-container-low rounded-xl hover:bg-primary/5 cursor-pointer transition-all has-[:checked]:bg-secondary/10 has-[:checked]:text-secondary">
                    <RadioGroupItem value={r} id={`reason-${r}`} className="border-secondary text-secondary" />
                    <Label htmlFor={`reason-${r}`} className="flex-1 cursor-pointer font-bold text-lg">{r}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <DialogFooter className="gap-4">
              <Button variant="ghost" onClick={handleBack} className="flex-1 h-14 text-primary/40 font-bold hover:bg-primary/5 rounded-xl">Back</Button>
              <Button onClick={handleNext} disabled={!reason} className="flex-1 h-14 bg-secondary hover:brightness-110 text-white font-bold text-lg rounded-xl shadow-lg transition-all">Next</Button>
            </DialogFooter>
          </>
        );
      case 4:
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-3xl font-headline font-bold text-red-600">Final Confirmation</DialogTitle>
              <DialogDescription className="text-lg pt-2 text-primary/60">
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-12 flex flex-col items-center text-center">
              <div className="bg-red-50 p-8 rounded-full mb-8">
                <AlertTriangle className="h-14 w-14 text-red-600" />
              </div>
              <p className="text-primary font-bold text-2xl leading-tight">
                Are you absolutely sure you want to cancel your {subscription.productName} subscription?
              </p>
              <p className="text-primary/50 mt-4 text-base font-medium">
                You will lose your 15% subscriber discount immediately.
              </p>
            </div>
            <DialogFooter className="flex-col sm:flex-col gap-4">
              <Button variant="destructive" className="w-full h-14 font-bold text-lg rounded-xl shadow-lg shadow-red-600/10 transition-all" onClick={handleCancel} disabled={isSubmitting}>
                {isSubmitting ? "Cancelling..." : "Yes, Cancel Subscription"}
              </Button>
              <Button variant="ghost" className="w-full h-12 text-primary/40 font-bold hover:bg-primary/5 rounded-xl" onClick={onClose} disabled={isSubmitting}>
                No, Keep It
              </Button>
            </DialogFooter>
          </>
        );
      case 5:
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-3xl font-headline font-bold text-primary">Subscription Cancelled</DialogTitle>
            </DialogHeader>
            <div className="py-16 text-center">
              <div className="bg-primary/5 p-8 rounded-full inline-block mb-8">
                <CheckCircle2 className="h-16 w-16 text-primary" />
              </div>
              <p className="text-primary/60 text-xl font-medium leading-relaxed max-w-[320px] mx-auto">
                Your subscription has been cancelled. You can reactivate it anytime from your dashboard.
              </p>
            </div>
            <DialogFooter>
              <Button className="w-full h-14 bg-primary text-white font-bold text-lg rounded-xl shadow-lg transition-all" onClick={onClose}>Done</Button>
            </DialogFooter>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-12 rounded-xl border-none shadow-[0px_20px_40px_rgba(6,27,14,0.15)] bg-surface !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2">
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}
