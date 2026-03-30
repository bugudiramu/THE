"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPatch } from "@/lib/api";
import { NEXT_STATUS, ACTION_LABELS } from "@modern-essentials/utils";

interface OrderActionProps {
  orderId: string;
  currentStatus: string;
}

export function OrderAction({ orderId, currentStatus }: OrderActionProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const nextStatus = NEXT_STATUS[currentStatus];
  const label = nextStatus ? ACTION_LABELS[nextStatus] : null;

  if (!nextStatus || !label) return null;

  const handleTransition = async () => {
    setLoading(true);
    try {
      await apiPatch(`admin/orders/${orderId}/status`, { status: nextStatus });
      router.refresh();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleTransition}
      disabled={loading}
      className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
    >
      {loading ? "..." : label}
    </button>
  );
}
