/**
 * DropdownMenu — menu tarik-turun berbasis @headlessui/react `Menu` (mis. menu aksi baris `⋯`, menu akun).
 *
 * - `DropdownMenu`          pembungkus (`Menu`).
 * - `DropdownMenuTrigger`   tombol pemicu (`MenuButton`); dukung `as={Button}` + props Button.
 * - `DropdownMenuContent`   panel item; `anchor` (default "bottom end"), `className`.
 * - `DropdownMenuItem`      props: `icon` (komponen Lucide), `href` (→ Inertia `<Link>`),
 *                           `method` (post/delete… untuk Link), `external` (→ `<a>` biasa),
 *                           `destructive` (merah), `disabled`, `onClick`, sisanya diteruskan.
 * - `DropdownMenuLabel`     judul kecil kelompok item.
 * - `DropdownMenuSeparator` garis pemisah.
 */
import * as React from "react"
import { Menu, MenuButton, MenuItem, MenuItems, MenuSeparator } from "@headlessui/react"
import { Link } from "@inertiajs/react"
import { cn } from "@/lib/utils"

const DropdownMenu = Menu

const DropdownMenuTrigger = MenuButton

const DropdownMenuContent = React.forwardRef(
  ({ className, anchor = "bottom end", ...props }, ref) => (
    <MenuItems
      ref={ref}
      anchor={anchor}
      transition
      className={cn(
        "z-50 min-w-48 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg outline-none [--anchor-gap:6px] [--anchor-padding:8px] transition duration-150 ease-out data-[closed]:scale-95 data-[closed]:opacity-0",
        className
      )}
      {...props}
    />
  )
)
DropdownMenuContent.displayName = "DropdownMenuContent"

const itemClasses =
  "flex min-h-10 w-full cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-foreground outline-none transition-colors data-[disabled]:cursor-not-allowed data-[focus]:bg-muted data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground"

const destructiveItemClasses = "text-danger data-[focus]:bg-danger-soft [&_svg]:text-danger"

const DropdownMenuItem = React.forwardRef(
  ({ className, icon: Icon, href, method, external = false, destructive = false, disabled = false, children, ...props }, ref) => {
    const classes = cn(itemClasses, destructive && destructiveItemClasses, className)
    const content = (
      <>
        {Icon && <Icon aria-hidden="true" />}
        <span className="min-w-0 flex-1 truncate">{children}</span>
      </>
    )

    let element

    if (href && external) {
      element = (
        <a ref={ref} href={href} className={classes} {...props}>
          {content}
        </a>
      )
    } else if (href) {
      const isNonGetMethod = method && method.toLowerCase() !== "get"

      element = (
        <Link
          ref={ref}
          href={href}
          method={method}
          as={isNonGetMethod ? "button" : undefined}
          className={classes}
          {...props}
        >
          {content}
        </Link>
      )
    } else {
      element = (
        <button ref={ref} type="button" className={classes} {...props}>
          {content}
        </button>
      )
    }

    return <MenuItem disabled={disabled}>{element}</MenuItem>
  }
)
DropdownMenuItem.displayName = "DropdownMenuItem"

function DropdownMenuLabel({ className, ...props }) {
  return (
    <div
      className={cn("px-2.5 py-1.5 text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  )
}

function DropdownMenuSeparator({ className, ...props }) {
  return <MenuSeparator className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
}
