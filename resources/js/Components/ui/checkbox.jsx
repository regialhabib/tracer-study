/**
 * Checkbox — checkbox NATIVE bergaya token (20px, warna primary saat dicentang).
 *
 * Props:
 * - semua atribut `<input type="checkbox">` (`checked`, `onChange`, `name`, `disabled`, ...).
 * - `onCheckedChange(checked: boolean)` pintasan selain `onChange`.
 * - `label`       teks/elemen label; bila diisi, checkbox dibungkus `<label>` yang bisa diketuk.
 * - `description` teks bantuan kecil di bawah label.
 * - `invalid`     true → set `aria-invalid` (border merah).
 */
import * as React from "react"
import { cn } from "@/lib/utils"

const checkboxClasses =
  "size-5 shrink-0 cursor-pointer rounded-[5px] border-input bg-card text-primary shadow-none transition-colors duration-150 focus:ring-0 focus:ring-offset-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger"

const Checkbox = React.forwardRef(
  ({ className, label, description, invalid, onChange, onCheckedChange, id, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const descriptionId = description ? `${inputId}-description` : undefined

    const handleChange = (event) => {
      onChange?.(event)
      onCheckedChange?.(event.target.checked)
    }

    const input = (
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        aria-invalid={invalid || undefined}
        aria-describedby={descriptionId}
        onChange={handleChange}
        className={cn(checkboxClasses, label ? "mt-0.5" : null, className)}
        {...props}
      />
    )

    if (!label) {
      return input
    }

    return (
      <label
        htmlFor={inputId}
        className="flex cursor-pointer items-start gap-3 text-sm text-foreground has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-70"
      >
        {input}
        <span className="flex flex-col gap-0.5">
          <span className="font-medium leading-6">{label}</span>
          {description && (
            <span id={descriptionId} className="text-xs text-muted-foreground">
              {description}
            </span>
          )}
        </span>
      </label>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox, checkboxClasses }
