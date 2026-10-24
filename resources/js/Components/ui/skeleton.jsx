/**
 * Skeleton — blok placeholder berdenyut saat konten dimuat (mis. deferred props).
 * Atur ukuran lewat `className` (mis. `h-4 w-32`, `h-24 w-full rounded-lg`).
 */
import * as React from "react"
import { cn } from "@/lib/utils"

const Skeleton = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    aria-hidden="true"
    className={cn("animate-pulse rounded-md bg-muted motion-reduce:animate-none", className)}
    {...props}
  />
))
Skeleton.displayName = "Skeleton"

export { Skeleton }
