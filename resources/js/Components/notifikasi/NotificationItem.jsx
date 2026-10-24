import { BellRing, CalendarClock, CircleCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const KIND_ICONS = {
    akun_diverifikasi: CircleCheck,
    kuesioner_dibuka: BellRing,
    pengingat_kuesioner: CalendarClock,
};

const dateTimeFormatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

/**
 * Waktu relatif singkat ("5 menit lalu"), beralih ke tanggal lengkap setelah 7 hari.
 */
export function formatNotificationTime(isoString) {
    if (!isoString) {
        return '';
    }

    const date = new Date(isoString);
    const seconds = Math.round((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) {
        return 'Baru saja';
    }
    if (seconds < 3600) {
        return `${Math.floor(seconds / 60)} menit lalu`;
    }
    if (seconds < 86400) {
        return `${Math.floor(seconds / 3600)} jam lalu`;
    }
    if (seconds < 7 * 86400) {
        return `${Math.floor(seconds / 86400)} hari lalu`;
    }

    return dateTimeFormatter.format(date);
}

/**
 * Isi satu baris notifikasi (ikon jenis, judul, pesan, waktu, penanda belum dibaca).
 * Pembungkus klik disediakan pemanggil.
 */
export default function NotificationItem({ item, className }) {
    const Icon = KIND_ICONS[item.kind] ?? BellRing;
    const isUnread = !item.read_at;

    return (
        <div className={cn('flex items-start gap-3', className)}>
            <span
                className={cn(
                    'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full',
                    isUnread ? 'bg-primary-soft text-primary' : 'bg-muted text-muted-foreground',
                )}
            >
                <Icon aria-hidden="true" className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
                <span className={cn('block text-sm text-foreground', isUnread ? 'font-semibold' : 'font-medium')}>
                    {item.title}
                    {isUnread && <span className="sr-only"> (belum dibaca)</span>}
                </span>
                <span className="mt-0.5 line-clamp-2 block text-sm text-muted-foreground">{item.message}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{formatNotificationTime(item.created_at)}</span>
            </span>
            {isUnread && <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-primary" />}
        </div>
    );
}
