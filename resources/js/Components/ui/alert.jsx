import * as React from "react"
import { cva } from "class-variance-authority"
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const successClasses = "border-success/25 bg-success-soft text-foreground [&>svg]:text-success"
const warningClasses = "border-warning/25 bg-warning-soft text-foreground [&>svg]:text-warning"
const dangerClasses = "border-danger/25 bg-danger-soft text-foreground [&>svg]:text-danger"
const infoClasses = "border-info/25 bg-info-soft text-foreground [&>svg]:text-info"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-3.5 [&>svg]:size-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-foreground",
        info: infoClasses,
        success: successClasses,
        warning: warningClasses,
        danger: dangerClasses,
        /* Alias lama — dipertahankan agar halaman lama tidak rusak. */
        destructive: dangerClasses,
        emerald: successClasses,
        amber: warningClasses,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const defaultIcons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
}

/**
 * Alert — kotak pemberitahuan dalam halaman.
 *
 * Props:
 * - `variant` default | info | success | warning | danger
 * - `icon`    komponen ikon Lucide pengganti, atau `false` untuk tanpa ikon. Varian
 *             info/success/warning/danger otomatis memakai ikon bawaan. Ikon juga bisa
 *             diberikan sebagai anak pertama (`<Alert><Info /> ...</Alert>`).
 */
const Alert = React.forwardRef(({ className, variant, icon, children, ...props }, ref) => {
  const Icon = icon === false ? null : (icon ?? defaultIcons[variant] ?? null)

  return (
    <div
      ref={ref}
      role={variant === "danger" || variant === "destructive" ? "alert" : "status"}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {Icon && <Icon aria-hidden="true" />}
      {children}
    </div>
  )
})
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-semibold leading-snug", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-foreground/80 [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription, alertVariants }
