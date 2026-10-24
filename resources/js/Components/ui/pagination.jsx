/**
 * Pagination — navigasi halaman dari paginator Laravel (`$paginator->links` / `->toArray()['links']`).
 *
 * Props:
 * - `links`         array `[{ url, label, active }]`. Item pertama = sebelumnya, terakhir = berikutnya
 *                   (label "&laquo; Previous"/"Next &raquo;" diganti ikon). Disembunyikan bila hanya 1 halaman.
 * - `preserveState` teruskan ke Inertia `<Link>` (default false). `preserveScroll` selalu aktif.
 * - `only`          array nama prop untuk partial reload (opsional).
 * - `label`         `aria-label` untuk `<nav>` (default "Navigasi halaman").
 * - `className`
 * Di mobile hanya tampil tombol sebelumnya, halaman aktif, dan berikutnya.
 */
import * as React from "react"
import { Link } from "@inertiajs/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const itemBaseClasses =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-md px-3 text-sm font-medium tabular-nums transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

function Pagination({ links, preserveState = false, only, label = "Navigasi halaman", className }) {
  if (!Array.isArray(links) || links.length <= 3) {
    return null
  }

  const lastIndex = links.length - 1

  return (
    <nav aria-label={label} className={cn("flex justify-center", className)}>
      <ul className="flex items-center gap-1">
        {links.map((link, index) => {
          const isPrevious = index === 0
          const isNext = index === lastIndex
          const isEdge = isPrevious || isNext
          const isEllipsis = !isEdge && !link.url
          const key = `${index}-${link.label}`

          if (isEllipsis) {
            return (
              <li key={key} aria-hidden="true" className="hidden sm:block">
                <span className="inline-flex h-10 min-w-10 items-center justify-center text-sm text-muted-foreground">
                  …
                </span>
              </li>
            )
          }

          const content = isEdge ? (
            <>
              {isPrevious ? (
                <ChevronLeft aria-hidden="true" className="size-4" />
              ) : (
                <ChevronRight aria-hidden="true" className="size-4" />
              )}
              <span className="sr-only">{isPrevious ? "Halaman sebelumnya" : "Halaman berikutnya"}</span>
            </>
          ) : (
            link.label
          )

          if (!link.url) {
            return (
              <li key={key}>
                <span
                  aria-disabled="true"
                  className={cn(itemBaseClasses, "cursor-not-allowed px-2 text-muted-foreground opacity-50")}
                >
                  {content}
                </span>
              </li>
            )
          }

          return (
            <li key={key} className={!isEdge && !link.active ? "hidden sm:block" : undefined}>
              <Link
                href={link.url}
                preserveScroll
                preserveState={preserveState}
                only={only}
                aria-current={link.active ? "page" : undefined}
                className={cn(
                  itemBaseClasses,
                  isEdge && "px-2",
                  link.active
                    ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                    : "text-foreground hover:bg-muted"
                )}
              >
                {content}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export { Pagination }
