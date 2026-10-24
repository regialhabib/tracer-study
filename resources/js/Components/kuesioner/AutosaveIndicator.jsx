import { AlertCircle, Check, CloudOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const formatTime = (iso) => {
    const date = new Date(iso);

    return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(date);
};

/**
 * Status simpan otomatis.
 * @param {{status: 'idle'|'saving'|'saved'|'offline'|'error', savedAt?: string|null}} props
 */
export default function AutosaveIndicator({ status = 'idle', savedAt = null }) {
    const time = savedAt ? formatTime(savedAt) : null;

    const states = {
        saving: { icon: Loader2, text: 'Menyimpan…', className: 'text-muted-foreground', spin: true },
        saved: { icon: Check, text: time ? `Tersimpan pukul ${time}` : 'Tersimpan', className: 'text-success' },
        offline: { icon: CloudOff, text: 'Offline — akan disimpan saat tersambung', className: 'text-warning' },
        error: { icon: AlertCircle, text: 'Gagal menyimpan. Coba lagi.', className: 'text-danger' },
    };
    const state = states[status];
    const Icon = state?.icon;

    return (
        <p role="status" aria-live="polite" className={cn('flex min-h-5 items-center gap-1.5 text-xs font-medium', state?.className)}>
            {state && (
                <>
                    <Icon aria-hidden="true" className={cn('size-4 shrink-0', state.spin && 'animate-spin')} />
                    <span>{state.text}</span>
                </>
            )}
        </p>
    );
}
