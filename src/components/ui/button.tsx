import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-[transform,background-color,border-color,color,box-shadow] duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:translate-y-px",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_16px_36px_-22px_rgba(26,24,20,0.75)] hover:bg-primary/92 hover:shadow-[0_20px_42px_-24px_rgba(26,24,20,0.85)]",
        destructive:
          "bg-destructive text-white shadow-[0_16px_36px_-24px_rgba(164,46,46,0.65)] hover:bg-destructive/92 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-border/80 bg-card/90 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] hover:bg-surface hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_14px_30px_-24px_rgba(26,24,20,0.5)] hover:bg-secondary/80",
        ghost:
          "text-muted-foreground hover:bg-secondary/80 hover:text-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        /** Billing plan grid: current tier (usually disabled) */
        billingCurrent:
          "border border-border/90 bg-muted text-muted-foreground shadow-none hover:bg-muted disabled:!opacity-100 disabled:cursor-not-allowed",
        /** Billing plan grid: upgrade — same emphasis as primary */
        billingUpgrade:
          "bg-primary text-primary-foreground shadow-[0_16px_36px_-22px_rgba(26,24,20,0.75)] hover:bg-primary/92 hover:shadow-[0_20px_42px_-24px_rgba(26,24,20,0.85)]",
        /** Billing plan grid: downgrade — cooler, lower-energy (chart-3 + muted) */
        billingDowngrade:
          "border border-chart-3/20 bg-chart-3/[0.11] text-chart-3 shadow-none hover:bg-chart-3/[0.18] hover:text-chart-3 dark:border-chart-3/30 dark:bg-chart-3/15 dark:text-chart-3 dark:hover:bg-chart-3/25",
      },
      size: {
        default: "h-10 px-5 py-2.5 has-[>svg]:px-4",
        xs: "h-9 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 rounded-lg gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-12 rounded-xl px-7 text-sm has-[>svg]:px-5",
        icon: "size-11",
        "icon-xs": "size-9 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-10",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
