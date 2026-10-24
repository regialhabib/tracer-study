/**
 * PageHeader — judul halaman (H1) + deskripsi + slot aksi; bertumpuk di mobile.
 *
 * Props:
 * - `title`       teks/elemen judul (H1: 22px → 24px, bold).
 * - `description` teks pendukung opsional.
 * - `actions`     node opsional di kanan (mis. tombol "Tambah Alumni").
 * - `children`    konten tambahan di bawah deskripsi (mis. badge status).
 * - `className`
 */
import * as React from "react"
import { cn } from "@/lib/utils"

const PageHeader = React.forwardRef(({ className, title, description, actions, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", className)}
    {...props}
  >
    <div className="min-w-0 space-y-1">
      <h1 className="text-[22px] font-bold leading-tight tracking-tight text-foreground md:text-2xl">{title}</h1>
      {description && <p className="max-w-prose text-sm text-muted-foreground">{description}</p>}
      {children}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2 sm:shrink-0">{actions}</div>}
  </div>
))
PageHeader.displayName = "PageHeader"

export { PageHeader }
