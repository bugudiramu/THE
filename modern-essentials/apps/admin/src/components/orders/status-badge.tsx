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
  pending: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  paid: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  picked: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  packed: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  dispatched: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  delivered: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  cancelled: "bg-red-500/15 text-red-600 dark:text-red-400",
  payment_failed: "bg-red-500/15 text-red-600 dark:text-red-400",
  refunded: "bg-gray-500/15 text-gray-600 dark:text-gray-400",
  default: "bg-gray-500/15 text-gray-600 dark:text-gray-400",
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
