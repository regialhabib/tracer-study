import { Link, router, usePage } from '@inertiajs/react';
import {
    ChartColumn,
    ClipboardList,
    ExternalLink,
    LayoutDashboard,
    LogOut,
    Menu,
    MessageSquare,
    Newspaper,
    ShieldCheck,
    UserCheck,
    UserRound,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, DropdownMenuItem, DropdownMenuSeparator, Sheet, SheetBody, SheetHeader, SheetTitle } from '@/Components/ui';
import NotificationBell from '@/Components/notifikasi/NotificationBell';
import { cn } from '@/lib/utils';
import AppShell from './Partials/AppShell';
import BrandLogo from './Partials/BrandLogo';
import UserMenu from './Partials/UserMenu';
import { COMING_SOON_LABEL, resolveNavItem } from './Partials/navigation';

/**
 * AdminLayout — kerangka panel admin (desktop-first, DESIGN.md §4.1).
 *
 * - ≥ lg: sidebar putih 256px dengan border kanan.
 * - < lg: top bar dengan tombol menu yang membuka `Sheet` berisi navigasi yang sama.
 * - Item yang route-nya belum ada tampil nonaktif "Segera hadir" dan otomatis aktif setelah route dibuat.
 *
 * Props:
 * - `title`    judul halaman di top bar. Bila kosong dan `header` berupa string, `header` dipakai sebagai judul.
 * - `header`   (opsional) node di atas konten (mis. `<PageHeader />`).
 * - `children` isi halaman.
 */
const adminNavigationGroups = [
    {
        label: 'Utama',
        items: [{ label: 'Ringkasan', icon: LayoutDashboard, routeName: 'admin.dashboard' }],
    },
    {
        label: 'Data Alumni',
        items: [
            { label: 'Alumni', icon: Users, routeName: 'admin.alumni.index', activePattern: 'admin.alumni.*' },
            { label: 'Verifikasi', icon: UserCheck, routeName: 'admin.verifikasi.index', activePattern: 'admin.verifikasi.*', badgeKey: 'verifikasi' },
        ],
    },
    {
        label: 'Tracer Study',
        items: [
            { label: 'Kuesioner', icon: ClipboardList, routeName: 'admin.kuesioner.index', activePattern: 'admin.kuesioner.*' },
            { label: 'Analitik', icon: ChartColumn, routeName: 'admin.analitik.index', activePattern: 'admin.analitik.*' },
        ],
    },
    {
        label: 'Komunikasi',
        items: [
            { label: 'Berita', icon: Newspaper, routeName: 'admin.berita.index', activePattern: 'admin.berita.*' },
            { label: 'Pesan', icon: MessageSquare, routeName: 'pesan.index', activePattern: 'pesan.*' },
        ],
    },
    {
        label: 'Pengaturan',
        items: [
            { label: 'Kelola Admin', icon: ShieldCheck, routeName: 'admin.pengguna.index', activePattern: 'admin.pengguna.*' },
        ],
    },
];

function SidebarNavItem({ item }) {
    const Icon = item.icon;
    const classes = 'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold transition-colors duration-150 ease-out [&_svg]:size-5 [&_svg]:shrink-0';

    if (!item.isAvailable) {
        return (
            <span
                aria-disabled="true"
                title={COMING_SOON_LABEL}
                className={cn(classes, 'cursor-not-allowed text-muted-foreground/70')}
            >
                <Icon aria-hidden="true" />
                <span className="flex-1 truncate">{item.label}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {COMING_SOON_LABEL}
                </span>
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
            <Icon aria-hidden="true" />
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge > 0 && (
                <span className="min-w-6 rounded-full bg-warning-soft px-2 py-0.5 text-center text-xs font-semibold tabular-nums text-warning">
                    {item.badge.toLocaleString('id-ID')}
                    <span className="sr-only"> menunggu</span>
                </span>
            )}
        </Link>
    );
}

function SidebarNavigation({ groups }) {
    return (
        <nav aria-label="Navigasi admin" className="flex flex-col gap-6">
            {groups.map((group) => (
                <div key={group.label} className="flex flex-col gap-1">
                    <p className="px-3 pb-1 text-xs font-medium text-muted-foreground">{group.label}</p>
                    {group.items.map((item) => (
                        <SidebarNavItem key={item.key} item={item} />
                    ))}
                </div>
            ))}
        </nav>
    );
}

export default function AdminLayout({ title, header, children }) {
    const [isNavigationOpen, setIsNavigationOpen] = useState(false);

    const pageTitle = title ?? (typeof header === 'string' ? header : undefined);
    const headerNode = typeof header === 'string' ? null : header;

    const adminBadges = usePage().props.adminBadges ?? {};

    const navigationGroups = adminNavigationGroups.map((group) => ({
        ...group,
        items: group.items.map((item) => ({
            ...resolveNavItem(item),
            badge: item.badgeKey ? adminBadges[item.badgeKey] : undefined,
        })),
    }));

    useEffect(() => router.on('navigate', () => setIsNavigationOpen(false)), []);

    return (
        <AppShell>
            <div className="min-h-screen bg-background text-foreground">
                <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card lg:flex">
                    <div className="flex h-16 shrink-0 items-center border-b border-border px-5">
                        <BrandLogo href={route('admin.dashboard')} title="Tracer Alumni" subtitle="Panel Admin" />
                    </div>
                    <div className="flex-1 overflow-y-auto px-3 py-5">
                        <SidebarNavigation groups={navigationGroups} />
                    </div>
                </aside>

                <Sheet open={isNavigationOpen} onClose={() => setIsNavigationOpen(false)} side="left" className="lg:hidden">
                    <SheetHeader className="border-b border-border">
                        <SheetTitle className="sr-only">Navigasi admin</SheetTitle>
                        <BrandLogo href={route('admin.dashboard')} title="Tracer Alumni" subtitle="Panel Admin" />
                    </SheetHeader>
                    <SheetBody className="px-3 py-5">
                        <SidebarNavigation groups={navigationGroups} />
                    </SheetBody>
                </Sheet>

                <div className="flex min-h-screen flex-col lg:pl-64">
                    <header className="sticky top-0 z-20 border-b border-border bg-card">
                        <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:h-16 lg:px-8">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsNavigationOpen(true)}
                                aria-label="Buka menu navigasi"
                                aria-expanded={isNavigationOpen}
                                className="-ml-2 lg:hidden [&_svg]:size-5"
                            >
                                <Menu aria-hidden="true" />
                            </Button>

                            <img src="/images/logo.webp" alt="" aria-hidden="true" className="size-8 shrink-0 object-contain lg:hidden" />

                            <div className="min-w-0 flex-1">
                                {pageTitle && (
                                    <p className="truncate text-base font-bold tracking-tight text-foreground lg:text-lg">
                                        {pageTitle}
                                    </p>
                                )}
                            </div>

                            <NotificationBell />

                            <UserMenu>
                                <DropdownMenuItem href="/" icon={ExternalLink}>
                                    Lihat situs
                                </DropdownMenuItem>
                                <DropdownMenuItem href={route('profile.edit')} icon={UserRound}>
                                    Profil
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem href={route('logout')} method="post" icon={LogOut} destructive>
                                    Keluar
                                </DropdownMenuItem>
                            </UserMenu>
                        </div>
                    </header>

                    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                        {headerNode && <div className="mb-6">{headerNode}</div>}
                        {children}
                    </main>
                </div>
            </div>
        </AppShell>
    );
}
