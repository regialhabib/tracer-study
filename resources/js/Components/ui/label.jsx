import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-snug text-foreground select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

/**
 * Label — label form di atas input.
 *
 * Props tambahan:
 * - `required` true → tampilkan `*` merah + teks "wajib" untuk pembaca layar.
 */
const Label = React.forwardRef(({ className, required = false, children, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  >
    {children}
    {required && (
      <>
        <span aria-hidden="true" className="ml-0.5 text-danger">*</span>
        <span className="sr-only"> (wajib)</span>
      </>
    )}
  </label>
))
Label.displayName = "Label"

export { Label, labelVariants }
