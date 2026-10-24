import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Spinner } from "./spinner"

const buttonVariants = cva(
  "inline-flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary: "bg-secondary text-secondary-foreground hover:bg-muted-foreground/15",
        outline: "border border-border bg-card text-foreground hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
        destructive: "bg-danger text-destructive-foreground hover:bg-danger/90",
        link: "h-auto px-0 py-0 text-brand-blue underline-offset-4 hover:underline",
        /** Alias lama — dipertahankan agar halaman lama tidak rusak. */
        pine: "bg-primary text-primary-foreground hover:bg-primary-hover",
        /** Alias lama — dipertahankan agar halaman lama tidak rusak. */
        rubric: "bg-accent text-accent-foreground hover:bg-muted-foreground/15",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        default: "h-10 px-4",
        lg: "h-11 px-6 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-9 w-9",
      },
    },
    compoundVariants: [
      { variant: "link", size: ["sm", "default", "lg"], className: "h-auto px-0" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * Button — tombol dengan varian DESIGN.md §7.
 *
 * Props tambahan:
 * - `variant`     default | secondary | outline | ghost | destructive | link
 * - `size`        sm (36px) | default (40px) | lg (44px) | icon | icon-sm
 * - `asChild`     render elemen anak (mis. Inertia `<Link>`) dengan gaya tombol.
 * - `loading`     tampilkan spinner dan nonaktifkan tombol.
 * - `loadingText` teks pengganti saat loading (mis. "Menyimpan…").
 */
const Button = React.forwardRef(
  (
    { className, variant, size, asChild = false, loading = false, loadingText, disabled, children, ...props },
    ref
  ) => {
    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={cn(buttonVariants({ variant, size, className }))}
          aria-disabled={disabled || loading || undefined}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && <Spinner decorative />}
        {loading && loadingText ? loadingText : children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
