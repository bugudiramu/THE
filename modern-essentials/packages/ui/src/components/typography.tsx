import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"

const headingVariants = cva(
  "font-headline tracking-tight text-foreground",
  {
    variants: {
      variant: {
        h1: "text-2xl font-extrabold lg:text-3xl",
        h2: "text-xl font-bold first:mt-0",
        h3: "text-lg font-bold",
        h4: "text-base font-bold",
        h5: "text-sm font-bold",
        h6: "text-xs font-bold",
      },
    },
    defaultVariants: {
      variant: "h1",
    },
  }
)

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}

const Heading = React.forwardRef<any, HeadingProps>(
  ({ className, variant, as, ...props }, ref) => {
    const Comp = as || variant || "h1"
    return (
      <Comp
        className={cn(headingVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Heading.displayName = "Heading"

const textVariants = cva(
  "font-body leading-relaxed",
  {
    variants: {
      variant: {
        default: "text-sm",
        lead: "text-base text-muted-foreground font-medium",
        large: "text-base font-semibold",
        small: "text-xs font-medium leading-none",
        muted: "text-xs text-muted-foreground",
        xs: "text-[10px] font-bold uppercase tracking-widest",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  as?: any
}

const Text = React.forwardRef<any, TextProps>(
  ({ className, variant, as: Comp = "p", ...props }, ref) => {
    return (
      <Comp
        className={cn(textVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Text.displayName = "Text"

export { Heading, Text, headingVariants, textVariants }
