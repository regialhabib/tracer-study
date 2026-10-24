import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { Bell, BellOff } from 'lucide-react';
import { Button, EmptyState, Skeleton, buttonVariants } from '@/Components/ui';
import { cn } from '@/lib/utils';
import NotificationItem from './NotificationItem';

function UnreadBadge({ count }) {
    if (!count) {
        return null;
    }

    return (
        <span
            aria-hidden="true"
            className="pointer-events-none absolute right-0.5 top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[11px] font-bold leading-[18px] text-primary-foreground"
        >
            {count > 99 ? '99+' : count}
        </span>
    );
}

/**
 * NotificationBell — lonceng di top bar. Mobile: tautan ke halaman penuh;
 * desktop (md+): dropdown 8 notifikasi terbaru yang dimuat saat dibuka.
 */
export default function NotificationBell() {
    const unread = usePage().props.notifikasi?.unread;
    const [state, setState] = useState({ status: 'idle', items: [] });

    if (unread === undefined || unread === null) {
        return null;
    }

    const label = unread > 0 ? `Notifikasi, ${unread} belum dibaca` : 'Notifikasi';
    const iconButtonClasses = cn(
        buttonVariants({ variant: 'ghost', size: 'icon' }),
        'relative text-muted-foreground [&_svg]:size-5',
    );

    const loadRecent = () => {
        setState((current) => ({ ...current, status: 'loading' }));

        window.axios
            .get(route('notifikasi.recent'))
            .then((response) => setState({ status: 'ready', items: response.data.items }))
            .catch(() => setState({ status: 'error', items: [] }));
    };

    const openItem = (item, close) => {
        close();
        router.post(route('notifikasi.read', item.id));
    };

    const markAllAsRead = () => {
        router.post(route('notifikasi.read-all'), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setState((current) => ({
                    ...current,
                    items: current.items.map((item) => ({ ...item, read_at: item.read_at ?? new Date().toISOString() })),
                }));
            },
        });
    };

    return (
        <>
            <Link href={route('notifikasi.index')} aria-label={label} className={cn(iconButtonClasses, 'md:hidden')}>
                <Bell aria-hidden="true" />
                <UnreadBadge count={unread} />
            </Link>

            <Popover className="hidden md:block">
                <PopoverButton aria-label={label} onClick={loadRecent} className={iconButtonClasses}>
                    <Bell aria-hidden="true" />
                    <UnreadBadge count={unread} />
                </PopoverButton>

                <PopoverPanel
                    anchor="bottom end"
                    transition
                    className="z-50 w-96 rounded-lg border border-border bg-popover text-popover-foreground shadow-lg outline-none [--anchor-gap:6px] [--anchor-padding:8px] transition duration-150 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
                >
                    {({ close }) => (
                        <div>
                            <div className="flex items-center justify-between border-b border-border px-4 py-2">
                                <p className="text-sm font-semibold text-foreground">Notifikasi</p>
                                {unread > 0 && (
                                    <Button variant="link" size="sm" onClick={markAllAsRead}>
                                        Tandai semua dibaca
                                    </Button>
                                )}
                            </div>

                            <div className="max-h-96 overflow-y-auto p-1">
                                {state.status === 'loading' && state.items.length === 0 && (
                                    <div className="space-y-3 p-3" role="status" aria-label="Memuat notifikasi">
                                        {[0, 1, 2].map((key) => (
                                            <div key={key} className="flex gap-3">
                                                <Skeleton className="size-9 rounded-full" />
                                                <div className="flex-1 space-y-2">
                                                    <Skeleton className="h-4 w-2/3" />
                                                    <Skeleton className="h-3 w-full" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {state.status === 'error' && (
                                    <EmptyState
                                        icon={BellOff}
                                        title="Notifikasi gagal dimuat"
                                        description="Periksa sambungan internet Anda, lalu coba lagi."
                                        action={
                                            <Button variant="outline" size="sm" onClick={loadRecent}>
                                                Muat Ulang
                                            </Button>
                                        }
                                    />
                                )}

                                {state.status === 'ready' && state.items.length === 0 && (
                                    <EmptyState
                                        icon={BellOff}
                                        title="Belum ada notifikasi"
                                        description="Kabar penting untuk Anda akan muncul di sini."
                                    />
                                )}

                                {state.items.length > 0 && (
                                    <ul>
                                        {state.items.map((item) => (
                                            <li key={item.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => openItem(item, close)}
                                                    className="w-full rounded-md p-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                >
                                                    <NotificationItem item={item} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="border-t border-border p-2">
                                <Link
                                    href={route('notifikasi.index')}
                                    onClick={() => close()}
                                    className="flex min-h-10 items-center justify-center rounded-md text-sm font-semibold text-primary transition-colors hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    Lihat Semua Notifikasi
                                </Link>
                            </div>
                        </div>
                    )}
                </PopoverPanel>
            </Popover>
        </>
    );
}
