/**
 * Select — `<select>` NATIVE bergaya Input (44px, 16px, fokus & invalid sama).
 * Native dipilih agar mudah diakses dan memakai pemilih bawaan HP.
 *
 * Props:
 * - semua atribut `<select>` (`value`, `onChange`, `name`, `disabled`, ...).
 * - `invalid`            true → set `aria-invalid` (border merah).
 * - `placeholder`        teks opsi kosong pertama (value ""), mis. "Pilih status".
 * - `containerClassName` kelas untuk pembungkus (lebar, margin).
 * - `children`           elemen `<option>` / `<optgroup>`.
 */
import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { inputBaseClasses } from "./input"

const Select = React.forwardRef(
  ({ className, containerClassName, invalid, placeholder, children, ...props }, ref) => (
    <div className={cn("relative w-full", containerClassName)}>
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          inputBaseClasses,
          "h-11 cursor-pointer appearance-none bg-none py-2 pr-10 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      >
        {placeholder !== undefined && (
          <option value="">{placeholder}</option>
        )}
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
)
Select.displayName = "Select"

export { Select }
