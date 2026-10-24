/**
 * Pembantu form: teks bantuan dan pesan error di sekitar input.
 *
 * - `FieldHint`  teks bantuan abu-abu (props: `id`, `className`, `children`).
 * - `FieldError` pesan error merah dengan ikon; tidak merender apa pun bila kosong.
 *                Props: `message` (atau `children`), `id` (hubungkan ke input via `aria-describedby`).
 */
import * as React from "react"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const FieldHint = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-xs text-muted-foreground", className)} {...props} />
))
FieldHint.displayName = "FieldHint"

const FieldError = React.forwardRef(({ className, message, children, ...props }, ref) => {
  const content = message ?? children

  if (!content) {
    return null
  }

  return (
    <p
      ref={ref}
      className={cn("flex items-start gap-1.5 text-sm font-medium text-danger", className)}
      {...props}
    >
      <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>{content}</span>
    </p>
  )
})
FieldError.displayName = "FieldError"

export { FieldHint, FieldError }
