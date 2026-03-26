"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function Header({ title }: { title: string }) {
  const router = useRouter();

  return (
    <header className="no-print flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white shadow-sm px-6">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.refresh()}
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
          OP
        </div>
      </div>
    </header>
  );
}
