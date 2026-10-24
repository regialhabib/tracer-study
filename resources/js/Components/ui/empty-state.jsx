/**
 * EmptyState — tampilan "belum ada data" (DESIGN.md §7).
 *
 * Props:
 * - `icon`        komponen ikon Lucide (dirender 24px di lingkaran `muted`).
 * - `title`       judul singkat, mis. "Belum ada alumni".
 * - `description` satu kalimat penjelasan.
 * - `action`      node opsional, mis. `<Button>Import Excel</Button>`.
 * - `className`
 */
import * as React from "react"
import { cn } from "@/lib/utils"

const EmptyState = React.forwardRef(({ className, icon: Icon, title, description, action, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col items-center justify-center px-6 py-10 text-center", className)}
    {...props}
  >
    {Icon && (
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon aria-hidden="true" className="size-6" />
      </div>
    )}
    {title && <h3 className="text-base font-semibold text-foreground">{title}</h3>}
    {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
    {children}
    {action && <div className="mt-5">{action}</div>}
  </div>
))
EmptyState.displayName = "EmptyState"

export { EmptyState }
