import { Badge } from '@/Components/ui';
import { ACCOUNT_STATUS_BADGE_VARIANTS, ACCOUNT_STATUS_LABELS, ALUMNI_STATUS_LABELS, labelFor } from '@/lib/labels';
import { CircleCheck, CircleSlash, Clock, Trash2 } from 'lucide-react';

const ACCOUNT_ICONS = {
    active: CircleCheck,
    pending: Clock,
    inactive: CircleSlash,
};

/** Badge status akun: ikon + teks + warna. */
export function AccountStatusBadge({ status, deleted = false }) {
    if (deleted) {
        return (
            <Badge variant="danger" icon={Trash2}>
                Dihapus
            </Badge>
        );
    }

    return (
        <Badge variant={ACCOUNT_STATUS_BADGE_VARIANTS[status] ?? 'neutral'} icon={ACCOUNT_ICONS[status]}>
            {labelFor(ACCOUNT_STATUS_LABELS, status)}
        </Badge>
    );
}

/** Badge status kegiatan alumni. */
export function ActivityStatusBadge({ status }) {
    if (!status) {
        return <span className="text-muted-foreground">-</span>;
    }

    return <Badge variant="info">{labelFor(ALUMNI_STATUS_LABELS, status)}</Badge>;
}
