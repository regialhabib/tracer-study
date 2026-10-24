import { Link, usePage } from '@inertiajs/react';
import { Bell, ClipboardList, House, LogOut, MessageCircle, Newspaper, Shield, UserRound } from 'lucide-react';
import { Button, DropdownMenuItem, DropdownMenuSeparator } from '@/Components/ui';
import { cn } from '@/lib/utils';
import AppShell from './Partials/AppShell';
import BrandLogo from './Partials/BrandLogo';
import UserMenu from './Partials/UserMenu';
import { COMING_SOON_LABEL, resolveNavItem } from './Partials/navigation';

/**
 * AlumniLayout — kerangka area alumni (mobile-first, DESIGN.md §4.1).
 *
 * - Top bar putih 56px: logo, navigasi (≥ md), lonceng notifikasi (placeholder), menu akun.
 * - Bottom navigation 64px di < md dengan 5 item; item yang route-nya belum ada tampil nonaktif.
 *
 * Props:
 * - `header`   (opsional) node judul/aksi di atas konten.
 * - `children` isi halaman.
 */
const alumniNavigation = [
    { label: 'Beranda', icon: House, routeName: 'dashboard' },
    { label: 'Kuesioner', icon: ClipboardList, routeName: 'alumni.kuesioner.index', activePattern: 'alumni.kuesioner.*' },
    { label: 'Kabar', icon: Newspaper, routeName: 'berita.index', activePattern: 'berita.*' },
    { label: 'Pesan', icon: MessageCircle, routeName: 'pesan.index', activePattern: 'pesan.*' },
    { label: 'Profil', icon: UserRound, routeName: 'profile.edit', activePattern: 'profile.*' },
];

function DesktopNavItem({ item }) {
    const Icon = item.icon;
    const classes = 'inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors duration-150 ease-out';

    if (!item.isAvailable) {
        return (
            <span
                aria-disabled="true"
                title={COMING_SOON_LABEL}
                className={cn(classes, 'cursor-not-allowed text-muted-foreground/70')}
            >
                <Icon aria-hidden="true" className="size-4" />
                {item.label}
                <span className="sr-only">({COMING_SOON_LABEL})</span>
            </span>
        );
    }

    return (
        <Link
            href={item.href}
            aria-current={item.isActive ? 'page' : undefined}
            className={cn(
                classes,
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                item.isActive
                    ? 'bg-primary-soft text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
        >
            <Icon aria-hidden="true" className="size-4" />
            {item.label}
        </Link>
    );
}

function BottomNavItem({ item }) {
    const Icon = item.icon;
    const classes = 'flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold leading-none transition-colors duration-150 ease-out';

    if (!item.isAvailable) {
        return (
            <span
                aria-disabled="true"
                title={COMING_SOON_LABEL}
                className={cn(classes, 'cursor-not-allowed text-muted-foreground/60')}
            >
                <Icon aria-hidden="true" className="size-5" />
                {item.label}
                <span className="sr-only">({COMING_SOON_LABEL})</span>
            </span>
        );
    }

    return (
        <Link
            href={item.href}
            aria-current={item.isActive ? 'page' : undefined}
            className={cn(
                classes,
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                item.isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
            )}
        >
            <span
                className={cn(
                    'flex h-7 w-12 items-center justify-center rounded-full transition-colors',
                    item.isActive && 'bg-primary-soft',
                )}
            >
                <Icon aria-hidden="true" className="size-5" />
            </span>
            {item.label}
        </Link>
    );
}

export default function AlumniLayout({ header, children }) {
    const user = usePage().props.auth?.user;
    const navigation = alumniNavigation.map(resolveNavItem);

    return (
        <AppShell>
            <div className="flex min-h-screen flex-col bg-background text-foreground">
                <header className="sticky top-0 z-40 border-b border-border bg-card">
                    <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                        <BrandLogo href={route('dashboard')} />

                        <nav aria-label="Navigasi utama" className="hidden flex-1 items-center justify-center gap-1 md:flex">
                            {navigation.map((item) => (
                                <DesktopNavItem key={item.key} item={item} />
                            ))}
                        </nav>

                        <div className="flex shrink-0 items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled
                                aria-label="Notifikasi (segera hadir)"
                                title="Notifikasi (segera hadir)"
                                className="text-muted-foreground [&_svg]:size-5"
                            >
                                <Bell aria-hidden="true" />
                            </Button>

                            <UserMenu>
                                <DropdownMenuItem href={route('profile.edit')} icon={UserRound}>
                                    Profil
                                </DropdownMenuItem>
                                {user?.role === 'admin' && route().has('admin.dashboard') && (
                                    <DropdownMenuItem href={route('admin.dashboard')} icon={Shield}>
                                        Panel Admin
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem href={route('logout')} method="post" icon={LogOut} destructive>
                                    Keluar
                                </DropdownMenuItem>
                            </UserMenu>
                        </div>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-6 md:pb-6 lg:px-8">
                    {header && <div className="mb-6">{header}</div>}
                    {children}
                </main>

                <nav
                    aria-label="Navigasi bawah"
                    className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
                >
                    <div className="mx-auto grid max-w-md grid-cols-5">
                        {navigation.map((item) => (
                            <BottomNavItem key={item.key} item={item} />
                        ))}
                    </div>
                </nav>
            </div>
        </AppShell>
    );
}
