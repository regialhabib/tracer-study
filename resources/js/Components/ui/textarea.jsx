import * as React from "react"
import { cn } from "@/lib/utils"
import { inputBaseClasses } from "./input"

/**
 * Textarea — area teks multi-baris dengan gaya yang sama seperti Input.
 *
 * Props tambahan:
 * - `invalid` true → set `aria-invalid` (border merah).
 */
const Textarea = React.forwardRef(({ className, invalid, ...props }, ref) => {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cn(inputBaseClasses, "flex min-h-[96px] py-2.5 leading-relaxed", className)}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
