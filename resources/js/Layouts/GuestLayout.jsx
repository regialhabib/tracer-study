import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import AppShell from './Partials/AppShell';

/**
 * GuestLayout — kerangka halaman autentikasi (masuk, daftar, lupa sandi, dst.).
 *
 * Logo + "Tracer Study Alumni" di atas kartu putih `max-w-md` yang berada di tengah layar,
 * lalu tautan kembali ke beranda di bawahnya.
 *
 * Props:
 * - `card`     bungkus `children` dengan kartu (default true). Halaman cukup mengisi isi form,
 *              tanpa `<Card>` sendiri, agar tidak terjadi kartu di dalam kartu.
 * - `children` isi halaman.
 */
export default function GuestLayout({ card = true, children }) {
    return (
        <AppShell>
            <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10 text-foreground sm:px-6">
                <div className="flex w-full max-w-md flex-col gap-6">
                    <Link
                        href="/"
                        className="flex flex-col items-center gap-3 rounded-md text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <img src="/images/logo.webp" alt="" aria-hidden="true" className="size-14 object-contain" />
                        <span className="flex flex-col gap-0.5">
                            <span className="text-lg font-bold leading-tight tracking-tight text-foreground">
                                Tracer Study Alumni
                            </span>
                            <span className="text-sm font-medium text-muted-foreground">PP Riyadhul Amien</span>
                        </span>
                    </Link>

                    <div className={cn(card && 'rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6')}>
                        {children}
                    </div>

                    <div className="flex flex-col items-center gap-2 text-center">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <ArrowLeft aria-hidden="true" className="size-4" />
                            Kembali ke Beranda
                        </Link>
                        <p className="text-xs text-muted-foreground">
                            &copy; {new Date().getFullYear()} Pondok Pesantren Riyadhul Amien
                        </p>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
