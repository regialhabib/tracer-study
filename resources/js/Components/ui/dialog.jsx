/**
 * Dialog — modal berbasis @headlessui/react `Dialog` (fokus terkunci, Esc menutup, klik latar menutup).
 * Pakai hanya untuk konfirmasi/form pendek; alur panjang → halaman tersendiri (DESIGN.md §9).
 *
 * `Dialog` props:
 * - `open` (boolean), `onClose()` (dipanggil saat Esc / klik latar / tombol tutup).
 * - `size`      sm | md (default) | lg | xl — lebar maksimum panel.
 * - `showClose` tampilkan tombol X di kanan atas (default true).
 * - `className` kelas tambahan untuk panel.
 *
 * Helper: `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogBody`, `DialogFooter`.
 * Contoh:
 *   <Dialog open={open} onClose={() => setOpen(false)}>
 *     <DialogHeader><DialogTitle>Hapus alumni?</DialogTitle><DialogDescription>…</DialogDescription></DialogHeader>
 *     <DialogFooter><Button variant="outline">Batal</Button><Button variant="destructive">Hapus</Button></DialogFooter>
 *   </Dialog>
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

const dialogSizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
}

const noop = () => {}

function Dialog({ open, onClose = noop, size = "md", showClose = true, className, children, ...props }) {
  return (
    <HeadlessDialog open={open} onClose={onClose} className="relative z-50" {...props}>
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-foreground/40 transition-opacity duration-200 ease-out data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel
          transition
          className={cn(
            "relative max-h-[calc(100dvh-2rem)] w-full overflow-y-auto rounded-xl border border-border bg-popover p-5 text-popover-foreground shadow-lg transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 sm:p-6",
            dialogSizes[size] ?? dialogSizes.md,
            className
          )}
        >
          {showClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
          {children}
        </DialogPanel>
      </div>
    </HeadlessDialog>
  )
}

function DialogHeader({ className, ...props }) {
  return <div className={cn("flex flex-col gap-1.5 pr-8", className)} {...props} />
}

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <HeadlessDialogTitle
    ref={ref}
    className={cn("text-lg font-semibold leading-snug tracking-tight text-foreground", className)}
    {...props}
  />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
))
DialogDescription.displayName = "DialogDescription"

function DialogBody({ className, ...props }) {
  return <div className={cn("mt-4", className)} {...props} />
}

function DialogFooter({ className, ...props }) {
  return (
    <div
      className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  )
}

export { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter }
