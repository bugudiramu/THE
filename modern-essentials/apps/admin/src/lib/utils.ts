import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price from paise to rupees string.
 */
export function formatPrice(paise: number): string {
  return `₹${(paise / 100).toFixed(2)}`;
}

/**
 * Format date to a readable "DD MMM YYYY, hh:mm a" string.
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format date to short "DD MMM" string.
 */
export function formatShortDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}
