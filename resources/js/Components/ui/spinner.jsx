/**
 * Spinner — indikator memuat berbasis ikon Lucide `Loader2`.
 *
 * Props:
 * - `label`      teks untuk pembaca layar (default "Memuat…").
 * - `decorative` true → disembunyikan dari pembaca layar (mis. di dalam tombol yang sudah berteks).
 * - `className`  ukuran/warna tambahan (default 16px, mengikuti warna teks).
 */
import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const Spinner = React.forwardRef(({ className, label = "Memuat…", decorative = false, ...props }, ref) => {
  if (decorative) {
    return (
      <Loader2
        ref={ref}
        aria-hidden="true"
        className={cn("size-4 shrink-0 animate-spin motion-reduce:animate-none", className)}
        {...props}
      />
    )
  }

  return (
    <span ref={ref} role="status" className="inline-flex items-center" {...props}>
      <Loader2
        aria-hidden="true"
        className={cn("size-4 shrink-0 animate-spin motion-reduce:animate-none", className)}
      />
      <span className="sr-only">{label}</span>
    </span>
  )
})
Spinner.displayName = "Spinner"

export { Spinner }
