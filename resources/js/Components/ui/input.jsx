import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Kelas dasar bersama untuk kontrol form (input, select, textarea): 16px agar iOS tidak
 * auto-zoom, fokus = border primary + ring, invalid (`aria-invalid`) = border danger.
 */
const inputBaseClasses =
  "w-full rounded-md border border-input bg-card px-3 text-base text-foreground shadow-none transition-colors duration-150 ease-out placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/25 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70 aria-[invalid=true]:border-danger aria-[invalid=true]:focus:border-danger aria-[invalid=true]:focus:ring-danger/20"

/**
 * Input — kolom teks setinggi 44px.
 *
 * Props tambahan:
 * - `invalid` true → set `aria-invalid` (border merah). Bisa juga langsung memberi `aria-invalid`.
 */
const Input = React.forwardRef(({ className, type, invalid, ...props }, ref) => {
  return (
    <input
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(
        inputBaseClasses,
        "flex h-11 py-2 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input, inputBaseClasses }
