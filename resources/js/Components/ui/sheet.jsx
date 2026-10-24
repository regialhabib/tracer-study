/**
 * Sheet — laci samping/bawah berbasis @headlessui/react `Dialog` (mis. navigasi admin di < 1024px).
 *
 * `Sheet` props:
 * - `open` (boolean), `onClose()`.
 * - `side`      left (default) | right | bottom.
 * - `showClose` tampilkan tombol X (default true).
 * - `className` kelas tambahan untuk panel (mis. lebar `max-w-xs`).
 *
 * Helper: `SheetHeader`, `SheetTitle`, `SheetDescription`, `SheetBody` (area scroll), `SheetFooter`.
 */
import * as React from "react"
import {
  Description,
  Dialog as HeadlessDialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle as HeadlessDialogTitle,
} from "@headlessui/react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const sheetSides = {
  left: "inset-y-0 left-0 h-full w-[85vw] max-w-xs rounded-r-xl border-r data-[closed]:-translate-x-full",
  right: "inset-y-0 right-0 h-full w-[85vw] max-w-sm rounded-l-xl border-l data-[closed]:translate-x-full",
  bottom: "inset-x-0 bottom-0 max-h-[85dvh] w-full rounded-t-xl border-t data-[closed]:translate-y-full",
}

const noop = () => {}

function Sheet({ open, onClose = noop, side = "left", showClose = true, className, children, ...props }) {
  return (
    <HeadlessDialog open={open} onClose={onClose} className="relative z-50" {...props}>
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-foreground/40 transition-opacity duration-200 ease-out data-[closed]:opacity-0"
      />
      <DialogPanel
        transition
        className={cn(
          "fixed flex flex-col border-border bg-popover text-popover-foreground shadow-lg transition-transform duration-200 ease-out",
          sheetSides[side] ?? sheetSides.left,
          className
        )}
      >
        {side === "bottom" && (
          <div aria-hidden="true" className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-muted" />
        )}
        {showClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="absolute right-3 top-3 z-10 inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
        {children}
      </DialogPanel>
    </HeadlessDialog>
  )
}

function SheetHeader({ className, ...props }) {
  return <div className={cn("flex shrink-0 flex-col gap-1 p-4 pr-14", className)} {...props} />
}

const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (
  <HeadlessDialogTitle
    ref={ref}
    className={cn("text-lg font-semibold leading-snug tracking-tight text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = "SheetTitle"

const SheetDescription = React.forwardRef(({ className, ...props }, ref) => (
  <Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
))
SheetDescription.displayName = "SheetDescription"

function SheetBody({ className, ...props }) {
  return <div className={cn("min-h-0 flex-1 overflow-y-auto px-4 pb-4", className)} {...props} />
}

function SheetFooter({ className, ...props }) {
  return (
    <div
      className={cn("flex shrink-0 flex-col gap-2 border-t border-border p-4", className)}
      {...props}
    />
  )
}

export { Sheet, SheetHeader, SheetTitle, SheetDescription, SheetBody, SheetFooter }
