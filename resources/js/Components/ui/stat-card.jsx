/**
 * StatCard — kartu statistik admin (DESIGN.md §7). Tanpa latar berwarna.
 *
 * Props:
 * - `label`   label kecil abu-abu, mis. "Response rate".
 * - `value`   angka besar (`text-3xl font-bold tabular-nums`), mis. "62,5%".
 * - `hint`    keterangan/konteks opsional, mis. "dari 1.240 alumni target".
 * - `icon`    komponen ikon Lucide opsional di kanan atas.
 * - `loading` true → tampilkan skeleton pengganti nilai (mis. saat deferred props).
 * - `className`
 */
import * as React from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "./skeleton"

const StatCard = React.forwardRef(
  ({ className, label, value, hint, icon: Icon, loading = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm md:p-6",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon && <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />}
      </div>
      {loading ? (
        <>
          <Skeleton className="mt-3 h-8 w-24" />
          {hint !== undefined && <Skeleton className="mt-2 h-3 w-32" />}
        </>
      ) : (
        <>
          <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-foreground">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </>
      )}
    </div>
  )
)
StatCard.displayName = "StatCard"

export { StatCard }
