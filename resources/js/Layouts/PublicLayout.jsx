import { Link, usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/Components/ui';
import AppShell from './Partials/AppShell';
import BrandLogo from './Partials/BrandLogo';

/**
 * PublicLayout — kerangka halaman publik (landing & berita, DESIGN.md §4.1).
 *
 * Header putih sederhana (logo + "Masuk"/"Dasbor"), slot konten, dan footer madrasah.
 * Lebar konten diatur oleh halaman masing-masing.
 *
 * Props:
 * - `navigation` (opsional) daftar tautan `{ label, href }` (mis. anchor `#berita`) yang tampil di header ≥ md.
 * - `children`   isi halaman.
 */
function dashboardRouteFor(user) {
    return user.role === 'admin' ? route('admin.dashboard') : route('dashboard');
}

export default function PublicLayout({ navigation = [], children }) {
    const user = usePage().props.auth?.user;
    const currentYear = new Date().getFullYear();

    return (
        <AppShell>
            <div className="flex min-h-screen flex-col bg-background text-foreground">
                <header className="sticky top-0 z-40 border-b border-border bg-card">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                        <BrandLogo title="Tracer Study Alumni" size="lg" />

                        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                            {navigation.length > 0 && (
                                <nav aria-label="Navigasi halaman" className="hidden items-center gap-1 md:flex">
                                    {navigation.map((link) => (
                                        <a
                                            key={link.href}
                                            href={link.href}
                                            className="rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            {link.label}
                                        </a>
                                    ))}
                                </nav>
                            )}

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
                            <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
                                Beranda
                            </Link>
                            {user ? (
                                <Link href={dashboardRouteFor(user)} className="text-muted-foreground transition-colors hover:text-foreground">
                                    Dasbor
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className="text-muted-foreground transition-colors hover:text-foreground">
                                        Masuk
                                    </Link>
                                    <Link href={route('register')} className="text-muted-foreground transition-colors hover:text-foreground">
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
