import { usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';

/**
 * PesanShell — kerangka dua panel (daftar ±320px + isi).
 * Tinggi menyesuaikan top bar/bottom nav layout sesuai peran.
 *
 * Props:
 * - `list`   node panel daftar percakapan.
 * - `active` 'list' | 'chat' — panel yang tampil di mobile (desktop selalu keduanya).
 */
export default function PesanShell({ list, active = 'list', children }) {
    const isAdmin = usePage().props.auth?.user?.role === 'admin';

    return (
        <div
            className={cn(
                'grid min-h-[26rem] overflow-hidden rounded-lg border border-border bg-card md:grid-cols-[320px_minmax(0,1fr)]',
                isAdmin
                    ? 'h-[calc(100dvh-6.5rem)] lg:h-[calc(100dvh-8rem)]'
                    : 'h-[calc(100dvh-10.5rem-env(safe-area-inset-bottom))] md:h-[calc(100dvh-6.5rem)]',
            )}
        >
            <section
                aria-label="Daftar percakapan"
                className={cn('min-h-0 flex-col border-border md:flex md:border-r', active === 'list' ? 'flex' : 'hidden')}
            >
                {list}
            </section>
            <section
                aria-label="Percakapan"
                className={cn('min-h-0 min-w-0 flex-col md:flex', active === 'chat' ? 'flex' : 'hidden')}
            >
                {children}
            </section>
        </div>
    );
}
