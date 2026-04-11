import { cn } from "@/lib/utils";

type BadgeVariant =
  | "pending"
  | "paid"
  | "picked"
  | "packed"
  | "dispatched"
  | "delivered"
  | "cancelled"
  | "payment_failed"
  | "refunded"
  | "default";

const variantStyles: Record<BadgeVariant, string> = {
  pending: "bg-secondary-fixed/40 text-on-secondary-fixed",
  paid: "bg-primary-fixed text-on-primary-fixed",
  picked: "bg-primary-fixed/70 text-on-primary-fixed",
  packed: "bg-primary-fixed/40 text-on-primary-fixed",
  dispatched: "bg-secondary-fixed text-on-secondary-fixed",
  delivered: "bg-primary-fixed text-on-primary-fixed",
  cancelled: "bg-surface-variant text-on-surface-variant",
  payment_failed: "bg-destructive/10 text-destructive",
  refunded: "bg-surface-container-high text-on-surface-variant",
  default: "bg-surface-container text-on-surface-variant",
};

export function StatusBadge({ status }: { status: string }) {
  const variant = (status.toLowerCase() as BadgeVariant) || "default";
  const style = variantStyles[variant] || variantStyles.default;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        style,
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
