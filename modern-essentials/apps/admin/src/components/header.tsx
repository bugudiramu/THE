"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function Header({ title }: { title: string }) {
  const router = useRouter();

  return (
    <header className="no-print flex h-24 shrink-0 items-center justify-between bg-surface px-10">
      <div className="space-y-1">
        <h2 className="text-3xl font-headline font-bold text-primary tracking-tight">{title}</h2>
        <div className="h-1 w-12 bg-secondary rounded-full" />
      </div>
      
      <div className="flex items-center gap-6">
        <button
          onClick={() => router.refresh()}
          className="flex items-center gap-2 rounded-full border border-outline-variant/30 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-primary/60 hover:bg-surface-container-low hover:text-primary transition-all duration-300"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh Core
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-outline-variant/20">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">Curation Lead</p>
            <p className="text-[9px] text-secondary font-bold uppercase tracking-tighter mt-1">Authorized</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-surface shadow-lg shadow-primary/20 ring-4 ring-surface">
            OP
          </div>
        </div>
      </div>
    </header>
  );
}
