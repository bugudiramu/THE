"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { STATUS_FILTERS } from "@modern-essentials/utils";

interface OrderFilterTabsProps {
  counts: Record<string, number>;
  total: number;
}

export function OrderFilterTabs({ counts, total }: OrderFilterTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get("status") || "ALL";

  const setFilter = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status === "ALL") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    router.push(`/orders?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {STATUS_FILTERS.map((s) => (
        <button
          key={s}
          onClick={() => setFilter(s)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            currentFilter === s
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          }`}
        >
          {s.replace(/_/g, " ")}
          {s !== "ALL" && (
            <span className="ml-1.5 opacity-70">
              ({counts[s] || 0})
            </span>
          )}
          {s === "ALL" && (
            <span className="ml-1.5 opacity-70">({total})</span>
          )}
        </button>
      ))}
    </div>
  );
}
