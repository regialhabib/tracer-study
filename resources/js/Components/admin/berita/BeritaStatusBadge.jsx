import { CalendarClock, CheckCircle2, FileEdit } from 'lucide-react';
import { Badge } from '@/Components/ui';

const STATES = {
    draft: { label: 'Draf', variant: 'neutral', icon: FileEdit },
    scheduled: { label: 'Terjadwal', variant: 'warning', icon: CalendarClock },
    published: { label: 'Terbit', variant: 'success', icon: CheckCircle2 },
};

/**
 * Lencana status berita: `state` = draft | scheduled | published.
 */
export default function BeritaStatusBadge({ state }) {
    const config = STATES[state] ?? STATES.draft;

    return (
        <Badge variant={config.variant} icon={config.icon}>
            {config.label}
        </Badge>
    );
}
