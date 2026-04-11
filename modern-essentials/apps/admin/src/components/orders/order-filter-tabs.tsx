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
    <div className="flex flex-wrap gap-2 py-4">
      {STATUS_FILTERS.map((s) => (
        <button
          key={s}
          onClick={() => setFilter(s)}
          className={`rounded-full px-5 py-2 text-xs font-medium transition-all duration-200 ${
            currentFilter === s
              ? "bg-[#3AAFA9] text-[#ffffff] shadow-sm"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
          }`}
        >
          {s.replace(/_/g, " ")}
          {s !== "ALL" && (
            <span className={`ml-1.5 opacity-80 ${currentFilter === s ? "text-[#ffffff]/80" : "text-on-surface-variant/70"}`}>
              ({counts[s] || 0})
            </span>
          )}
          {s === "ALL" && (
            <span className={`ml-1.5 opacity-80 ${currentFilter === s ? "text-[#ffffff]/80" : "text-on-surface-variant/70"}`}>
              ({total})
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
