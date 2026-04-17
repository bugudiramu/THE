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
  Heading,
  Text,
  Card
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
            <DialogHeader className="text-left space-y-4">
              <DialogTitle>
                <Heading variant="h2" className="text-primary tracking-tighter">Wait! Look at what you've achieved</Heading>
              </DialogTitle>
              <DialogDescription asChild>
                <Text variant="lead" className="text-primary/60 font-medium">You're part of the radical transparency movement.</Text>
              </DialogDescription>
            </DialogHeader>
            <div className="py-10 space-y-6">
              <Card className="bg-primary/5 p-6 rounded-[32px] flex items-start gap-6 border-none shadow-sm">
                <div className="bg-surface p-4 rounded-2xl shadow-sm shrink-0">
                  <Gift className="h-6 w-6 text-secondary" />
                </div>
                <div className="space-y-1">
                  <Heading variant="h4" className="text-primary text-xl">
                    {subscription.totalDeliveries || 8} Deliveries Received
                  </Heading>
                  <Text variant="small" className="text-primary/50 leading-relaxed font-medium">
                    That's approx {(subscription.totalDeliveries || 8) * 6} farm-fresh eggs delivered to your door.
                  </Text>
                </div>
              </Card>
              <Card className="bg-secondary/5 p-6 rounded-[32px] flex items-start gap-6 border-none shadow-sm">
                <div className="bg-surface p-4 rounded-2xl shadow-sm shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-secondary" />
                </div>
                <div className="space-y-1">
                  <Heading variant="h4" className="text-secondary text-xl">
                    ₹{subscription.totalSavings || 450} Saved
                  </Heading>
                  <Text variant="small" className="text-secondary/70 leading-relaxed font-medium">
                    Subscribers always get our best price and priority inventory access.
                  </Text>
                </div>
              </Card>
            </div>
            <DialogFooter className="flex-col sm:flex-col gap-4">
              <Button size="lg" className="w-full h-16 bg-secondary hover:brightness-110 text-white font-bold rounded-2xl shadow-lg transition-all" onClick={onClose}>
                Keep My Subscription
              </Button>
              <Button variant="ghost" className="w-full h-12 text-primary/30 font-bold hover:bg-primary/5 rounded-xl transition-colors" onClick={handleNext}>
                Continue to Cancel
              </Button>
            </DialogFooter>
          </>
        );
      case 2:
        return (
          <>
            <DialogHeader className="text-left space-y-4">
              <DialogTitle>
                <Heading variant="h2" className="text-primary tracking-tighter">Need a break instead?</Heading>
              </DialogTitle>
              <DialogDescription asChild>
                <Text variant="lead" className="text-primary/60 font-medium">Most customers prefer pausing when they're away or have too much stock.</Text>
              </DialogDescription>
            </DialogHeader>
            <div className="py-10">
              <Card className="text-center p-10 bg-surface-container-low rounded-[32px] border-none shadow-inner space-y-8">
                <Text className="text-primary/60 font-medium leading-relaxed">
                  Pause for 1-4 weeks and we'll automatically resume when you're ready. No reactivation needed.
                </Text>
                <Button size="lg" className="w-full h-16 bg-primary text-white hover:brightness-110 font-bold rounded-2xl shadow-xl transition-all" onClick={onPauseInstead}>
                  Pause Subscription Instead
                </Button>
              </Card>
            </div>
            <DialogFooter className="justify-between items-center pt-4">
              <Button variant="ghost" onClick={handleBack} className="gap-3 text-primary/40 font-bold hover:bg-primary/5 rounded-xl h-auto py-2">
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
            <DialogHeader className="text-left space-y-4">
              <DialogTitle>
                <Heading variant="h2" className="text-primary tracking-tighter">Why are you leaving?</Heading>
              </DialogTitle>
              <DialogDescription asChild>
                <Text variant="lead" className="text-primary/60 font-medium">Help us improve the movement.</Text>
              </DialogDescription>
            </DialogHeader>
            <div className="py-10">
              <RadioGroup value={reason} onValueChange={setReason} className="space-y-4">
                {reasons.map((r) => (
                  <Label
                    key={r}
                    htmlFor={`reason-${r}`}
                    className="flex items-center space-x-4 p-6 bg-surface-container-low rounded-[24px] hover:bg-primary/5 cursor-pointer transition-all has-[:checked]:bg-secondary/10 has-[:checked]:text-secondary group"
                  >
                    <RadioGroupItem value={r} id={`reason-${r}`} className="border-secondary text-secondary" />
                    <Heading variant="h4" className="flex-1 cursor-pointer text-lg text-primary group-has-[:checked]:text-secondary">{r}</Heading>
                  </Label>
                ))}
              </RadioGroup>
            </div>
            <DialogFooter className="gap-6 sm:flex-row">
              <Button variant="ghost" onClick={handleBack} className="flex-1 h-16 text-primary/40 font-bold hover:bg-primary/5 rounded-2xl">Back</Button>
              <Button size="lg" onClick={handleNext} disabled={!reason} className="flex-1 h-16 bg-secondary hover:brightness-110 text-white font-bold rounded-2xl shadow-lg transition-all">Next</Button>
            </DialogFooter>
          </>
        );
      case 4:
        return (
          <>
            <DialogHeader className="text-left space-y-4">
              <DialogTitle>
                <Heading variant="h2" className="text-destructive tracking-tighter">Final Confirmation</Heading>
              </DialogTitle>
              <DialogDescription asChild>
                <Text variant="lead" className="text-primary/60 font-medium">This action cannot be undone.</Text>
              </DialogDescription>
            </DialogHeader>
            <div className="py-12 flex flex-col items-center text-center space-y-8">
              <div className="bg-destructive/5 p-10 rounded-full">
                <AlertTriangle className="h-16 w-16 text-destructive" />
              </div>
              <div className="space-y-4">
                <Heading variant="h3" className="text-primary leading-tight">
                  Are you absolutely sure you want to cancel your {subscription.productName} subscription?
                </Heading>
                <Text className="text-primary/40 font-medium">
                  You will lose your 15% subscriber discount immediately.
                </Text>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-col gap-4">
              <Button variant="destructive" size="lg" className="w-full h-16 font-bold rounded-2xl shadow-xl shadow-destructive/10 transition-all" onClick={handleCancel} disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Yes, Cancel Subscription"}
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
            <DialogHeader className="text-center">
              <DialogTitle>
                <Heading variant="h2" className="text-primary tracking-tighter">Subscription Cancelled</Heading>
              </DialogTitle>
            </DialogHeader>
            <div className="py-16 text-center space-y-8">
              <div className="bg-primary/5 p-10 rounded-full inline-block">
                <CheckCircle2 className="h-20 w-20 text-primary" />
              </div>
              <Text variant="lead" className="text-primary/60 max-w-[340px] mx-auto leading-relaxed">
                Your subscription has been cancelled. You can reactivate it anytime from your dashboard.
              </Text>
            </div>
            <DialogFooter>
              <Button size="lg" className="w-full h-16 bg-primary text-white font-bold rounded-2xl shadow-xl transition-all" onClick={onClose}>Done</Button>
            </DialogFooter>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-12 rounded-[40px] border-none shadow-2xl bg-surface !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2">
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}
