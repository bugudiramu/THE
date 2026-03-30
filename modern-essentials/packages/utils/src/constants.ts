export const STATUS_FILTERS = [
  "ALL",
  "PENDING",
  "PAID",
  "PICKED",
  "PACKED",
  "DISPATCHED",
  "DELIVERED",
  "CANCELLED",
  "PAYMENT_FAILED",
];

export const NEXT_STATUS: Record<string, string> = {
  PAID: "PICKED",
  PICKED: "PACKED",
  PACKED: "DISPATCHED",
  DISPATCHED: "DELIVERED",
};

export const ACTION_LABELS: Record<string, string> = {
  PICKED: "Mark Picked",
  PACKED: "Mark Packed",
  DISPATCHED: "Mark Dispatched",
  DELIVERED: "Mark Delivered",
};
