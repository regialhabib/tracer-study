/**
 * Sistem toast sederhana tanpa pustaka luar (store tingkat modul + subscribe).
 *
 * - `<Toaster />`   pasang SEKALI di layout. Desktop: kanan bawah; mobile: atas tengah. `aria-live="polite"`.
 * - `toast({ title, description, variant, duration })` → id. `variant`: success | danger | info (default) | warning.
 *                   Hilang otomatis setelah 4 detik, kecuali `danger` (tetap sampai ditutup).
 *                   `duration` (ms) menimpa default; `null` = tidak hilang otomatis.
 *   Pintasan: `toast.success(title, opsi)`, `toast.error(title, opsi)`, `toast.info(...)`, `toast.warning(...)`,
 *   `toast.dismiss(id)`.
 * - `useFlashToasts()` panggil di layout: membaca `usePage().props.flash` (`status` → success,
 *   `error` → danger) dan menampilkan toast setiap kali flash dari server berubah.
 */
import * as React from "react"
import { usePage } from "@inertiajs/react"
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const AUTO_DISMISS_MS = 4000
const MAX_VISIBLE_TOASTS = 4

let toasts = []
let nextToastId = 0
const listeners = new Set()
const dismissTimers = new Map()

function emitChange() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener) {
  listeners.add(listener)

  return () => listeners.delete(listener)
}

function getSnapshot() {
  return toasts
}

function dismissToast(id) {
  clearTimeout(dismissTimers.get(id))
  dismissTimers.delete(id)
  toasts = toasts.filter((item) => item.id !== id)
  emitChange()
}

function toast({ title, description, variant = "info", duration } = {}) {
  const id = ++nextToastId
  const dismissAfter = duration !== undefined ? duration : variant === "danger" ? null : AUTO_DISMISS_MS

  const nextToasts = [...toasts, { id, title, description, variant }]
  nextToasts.slice(0, Math.max(nextToasts.length - MAX_VISIBLE_TOASTS, 0)).forEach((item) => {
    clearTimeout(dismissTimers.get(item.id))
    dismissTimers.delete(item.id)
  })
  toasts = nextToasts.slice(-MAX_VISIBLE_TOASTS)
  emitChange()

  if (dismissAfter) {
    dismissTimers.set(id, setTimeout(() => dismissToast(id), dismissAfter))
  }

  return id
}

toast.success = (title, options = {}) => toast({ ...options, title, variant: "success" })
toast.error = (title, options = {}) => toast({ ...options, title, variant: "danger" })
toast.info = (title, options = {}) => toast({ ...options, title, variant: "info" })
toast.warning = (title, options = {}) => toast({ ...options, title, variant: "warning" })
toast.dismiss = dismissToast

const toastVariants = {
  success: { icon: CheckCircle2, iconClassName: "text-success" },
  danger: { icon: XCircle, iconClassName: "text-danger" },
  warning: { icon: AlertTriangle, iconClassName: "text-warning" },
  info: { icon: Info, iconClassName: "text-info" },
}

function ToastItem({ item }) {
  const config = toastVariants[item.variant] ?? toastVariants.info
  const Icon = config.icon

  return (
    <div
      role={item.variant === "danger" ? "alert" : "status"}
      className="pointer-events-auto flex w-full max-w-sm animate-slide-up items-start gap-3 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg"
    >
      <Icon aria-hidden="true" className={cn("mt-0.5 size-5 shrink-0", config.iconClassName)} />
      <div className="min-w-0 flex-1">
        {item.title && <p className="text-sm font-semibold leading-5 text-foreground">{item.title}</p>}
        {item.description && <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>}
      </div>
      <button
        type="button"
        onClick={() => dismissToast(item.id)}
        aria-label="Tutup notifikasi"
        className="-m-1.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}

function Toaster({ className }) {
  const items = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:bottom-0 sm:right-0 sm:top-auto sm:items-end sm:p-6",
        className
      )}
    >
      {items.map((item) => (
        <ToastItem key={item.id} item={item} />
      ))}
    </div>
  )
}

/** Objek flash yang sudah pernah ditampilkan, agar StrictMode/remount tidak memunculkan toast ganda. */
const shownFlashes = new WeakSet()

function useFlashToasts() {
  const { flash } = usePage().props

  React.useEffect(() => {
    if (!flash || typeof flash !== "object" || shownFlashes.has(flash)) {
      return
    }

    shownFlashes.add(flash)

    if (flash.status) {
      toast({ title: flash.status, variant: "success" })
    }

    if (flash.error) {
      toast({ title: flash.error, variant: "danger" })
    }
  }, [flash])
}

export { Toaster, toast, useFlashToasts }
