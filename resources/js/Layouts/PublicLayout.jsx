import { Link, usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/Components/ui';
import { cn } from '@/lib/utils';
import AppShell from './Partials/AppShell';
import BrandLogo from './Partials/BrandLogo';

/**
 * PublicLayout — kerangka halaman publik (landing & berita, DESIGN.md §4.1).
 *
 * Header putih (logo, navigasi Beranda/Kabar dengan penanda halaman aktif, "Masuk"/"Dasbor"),
 * slot konten, dan footer madrasah. Lebar konten diatur oleh halaman masing-masing.
 */
function dashboardRouteFor(user) {
    return user.role === 'admin' ? route('admin.dashboard') : route('dashboard');
}

/**
 * Tautan header. `mobileLabel` null berarti tautan disembunyikan di bawah md (logo sudah mengarah ke beranda).
 */
const NAV_LINKS = [
    { label: 'Beranda', mobileLabel: null, href: '/', isActive: (url) => url === '/' || url.startsWith('/?') },
    { label: 'Kabar & Agenda', mobileLabel: 'Kabar', href: '/berita', isActive: (url) => url.startsWith('/berita') },
];

const footerLinkClasses = 'text-muted-foreground transition-colors hover:text-foreground';

export default function PublicLayout({ children }) {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const currentYear = new Date().getFullYear();

    return (
        <AppShell>
            <div className="flex min-h-screen flex-col bg-background text-foreground">
                <header className="sticky top-0 z-40 border-b border-border bg-card">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                        <BrandLogo title="Tracer Study Alumni" size="lg" />

                        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
                            <nav aria-label="Navigasi utama" className="flex items-center gap-1">
                                {NAV_LINKS.map((link) => {
                                    const active = link.isActive(url);

                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            aria-current={active ? 'page' : undefined}
                                            className={cn(
                                                'rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                                active
                                                    ? 'text-primary'
                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                                !link.mobileLabel && 'hidden md:inline-flex',
                                            )}
                                        >
                                            {link.mobileLabel ? (
                                                <>
                                                    <span className="md:hidden">{link.mobileLabel}</span>
                                                    <span className="hidden md:inline">{link.label}</span>
                                                </>
                                            ) : (
                                                link.label
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>

                            <span aria-hidden="true" className="hidden h-5 w-px bg-border md:block" />

                            {user ? (
                                <Button asChild size="sm">
                                    <Link href={dashboardRouteFor(user)}>
                                        Dasbor
                                        <ArrowRight aria-hidden="true" />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
                                        <Link href={route('register')}>Daftar</Link>
                                    </Button>
                                    <Button asChild size="sm">
                                        <Link href={route('login')}>Masuk</Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1">{children}</main>

                <footer className="border-t border-border bg-card">
                    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-start md:justify-between lg:px-8">
                        <div className="flex max-w-sm flex-col gap-3">
                            <div className="flex items-center gap-2.5">
                                <img src="/images/logo.webp" alt="" aria-hidden="true" className="size-8 object-contain" />
                                <span className="text-sm font-bold text-foreground">Pondok Pesantren Riyadhul Amien</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Sistem tracer study untuk menjaga silaturahmi dan menelusuri kiprah alumni Madrasah Aliyah
                                PP Riyadhul Amien.
                            </p>
                        </div>

                        <nav aria-label="Tautan footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
                            {NAV_LINKS.map((link) => (
                                <Link key={link.href} href={link.href} className={footerLinkClasses}>
                                    {link.label}
                                </Link>
                            ))}
                            {user ? (
                                <Link href={dashboardRouteFor(user)} className={footerLinkClasses}>
                                    Dasbor
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className={footerLinkClasses}>
                                        Masuk
                                    </Link>
                                    <Link href={route('register')} className={footerLinkClasses}>
                                        Daftar
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>

                    <div className="border-t border-border">
                        <p className="mx-auto max-w-6xl px-4 py-4 text-xs font-medium text-muted-foreground sm:px-6 lg:px-8">
                            &copy; {currentYear} Pondok Pesantren Riyadhul Amien. Seluruh hak cipta dilindungi.
                        </p>
                    </div>
                </footer>
            </div>
        </AppShell>
    );
}
