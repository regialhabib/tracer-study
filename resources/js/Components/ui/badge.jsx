import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const successClasses = "border-success/20 bg-success-soft text-success"
const warningClasses = "border-warning/20 bg-warning-soft text-warning"
const dangerClasses = "border-danger/20 bg-danger-soft text-danger"
const infoClasses = "border-info/20 bg-info-soft text-info"
const neutralClasses = "border-transparent bg-muted text-foreground/70"

const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border bg-transparent text-foreground",
        success: successClasses,
        warning: warningClasses,
        danger: dangerClasses,
        info: infoClasses,
        neutral: neutralClasses,
        /* Alias lama — dipertahankan agar halaman lama tidak rusak. */
        emerald: successClasses,
        pine: successClasses,
        stamp: successClasses,
        amber: warningClasses,
        rubric: warningClasses,
        destructive: dangerClasses,
        blue: infoClasses,
        purple: "border-chart-4/20 bg-chart-4/10 text-chart-4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * Badge — label status berbentuk pill (DESIGN.md §2.2 & §7).
 *
 * Props:
 * - `variant` default | secondary | outline | success | warning | danger | info | neutral
 * - `icon`    komponen ikon Lucide opsional (dirender 12px sebelum teks).
 */
const Badge = React.forwardRef(({ className, variant, icon: Icon, children, ...props }, ref) => (
  <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props}>
    {Icon && <Icon aria-hidden="true" />}
    {children}
  </span>
))
Badge.displayName = "Badge"

export { Badge, badgeVariants }
