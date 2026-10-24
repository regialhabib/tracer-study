import { Link } from '@inertiajs/react';
import { Calendar } from 'lucide-react';
import { Card } from '@/Components/ui';
import BeritaCover from './BeritaCover';
import BeritaTypeBadge from './BeritaTypeBadge';
import { formatShortDate } from './beritaMeta';

/**
 * BeritaCard — kartu ringkas kabar untuk grid (sampul 16:9, badge tipe, judul, tanggal, cuplikan).
 * Seluruh kartu dapat diketuk lewat tautan judul yang direntangkan.
 *
 * Props:
 * - `berita` `{ slug, title, type, thumbnail, published_at, content? }`.
 *            Cuplikan hanya tampil bila `content` tersedia.
 */
export default function BeritaCard({ berita }) {
    const publishedDate = formatShortDate(berita.published_at);

    return (
        <Card className="group relative flex flex-col overflow-hidden transition-colors duration-150 ease-out focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:border-primary/30">
            <BeritaCover src={berita.thumbnail} alt="" type={berita.type} />

            <div className="flex flex-1 flex-col gap-2 p-4 md:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <BeritaTypeBadge type={berita.type} />
                    {publishedDate && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                            <Calendar aria-hidden="true" className="size-3.5" />
                            <time dateTime={berita.published_at}>{publishedDate}</time>
                        </span>
                    )}
                </div>

                <h3 className="text-base font-semibold leading-snug text-foreground">
                    <Link
                        href={route('berita.show', berita.slug)}
                        className="line-clamp-2 transition-colors duration-150 after:absolute after:inset-0 focus-visible:outline-none group-hover:text-primary"
                    >
                        {berita.title}
                    </Link>
                </h3>

                {berita.content && <p className="line-clamp-3 text-sm text-muted-foreground">{berita.content}</p>}
            </div>
        </Card>
    );
}
