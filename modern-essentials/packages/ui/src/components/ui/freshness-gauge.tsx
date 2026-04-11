import * as React from "react"
import { cn } from "../../lib/utils"

export interface FreshnessGaugeProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  label: string;
}

function FreshnessGauge({ className, icon, label, ...props }: FreshnessGaugeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center space-x-2 px-3 py-1 bg-primary-fixed text-on-primary-fixed rounded-full font-label text-sm font-semibold tracking-[0.02em]",
        className
      )}
      {...props}
    >
      {icon && (
        <span className="flex shrink-0 items-center justify-center [&>svg]:size-4">
          {icon}
        </span>
      )}
      <span className="uppercase tracking-widest text-xs font-bold">{label}</span>
    </div>
  )
}

export { FreshnessGauge }