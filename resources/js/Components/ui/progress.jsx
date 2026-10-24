/**
 * Progress — bar progres tipis (mis. "Bagian 2 dari 4" di kuesioner).
 *
 * Props:
 * - `value`              nilai saat ini (default 0).
 * - `max`                nilai maksimum (default 100).
 * - `label`              label aksesibel (`aria-label`), mis. "Progres pengisian kuesioner".
 * - `valueText`          teks nilai untuk pembaca layar (`aria-valuetext`), mis. "Bagian 2 dari 4".
 * - `indicatorClassName` kelas tambahan untuk batang isi.
 */
import * as React from "react"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef(
  ({ className, indicatorClassName, value = 0, max = 100, label, valueText, ...props }, ref) => {
    const safeMax = max > 0 ? max : 100
    const clampedValue = Math.min(Math.max(Number(value) || 0, 0), safeMax)
    const percentage = (clampedValue / safeMax) * 100

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={clampedValue}
        aria-valuetext={valueText}
        aria-label={label}
        className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}
        {...props}
      >
        <div
          className={cn(
            "h-full rounded-full bg-primary transition-[width] duration-200 ease-out motion-reduce:transition-none",
            indicatorClassName
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
