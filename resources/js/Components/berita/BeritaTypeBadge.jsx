import { Badge } from '@/Components/ui';
import { getBeritaTypeMeta } from './beritaMeta';

/**
 * BeritaTypeBadge — badge tipe kabar (berita/agenda/pengumuman/info_beasiswa) dengan ikon + label.
 *
 * Props:
 * - `type`      tipe kabar dari DB (default "berita").
 * - `className`
 */
export default function BeritaTypeBadge({ type, className }) {
    const meta = getBeritaTypeMeta(type);

    return (
        <Badge variant={meta.variant} icon={meta.icon} className={className}>
            {meta.label}
        </Badge>
    );
}
