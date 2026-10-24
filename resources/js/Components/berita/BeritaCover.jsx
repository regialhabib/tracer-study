import { cn } from '@/lib/utils';
import { getBeritaTypeMeta } from './beritaMeta';

/**
 * BeritaCover — sampul kabar rasio 16:9 (`object-cover`).
 * Bila `src` kosong, tampil placeholder netral berisi ikon tipe kabar di atas latar `muted` (DESIGN.md §6).
 *
 * Props:
 * - `src`       URL gambar (boleh null).
 * - `alt`       teks alternatif.
 * - `type`      tipe kabar untuk ikon placeholder.
 * - `loading`   "lazy" (default) | "eager".
 * - `className` kelas tambahan untuk pembungkus (mis. radius).
 */
export default function BeritaCover({ src, alt = '', type, loading = 'lazy', className }) {
    const { icon: TypeIcon } = getBeritaTypeMeta(type);

    return (
        <div className={cn('relative aspect-video w-full overflow-hidden bg-muted', className)}>
            {src ? (
                <img src={src} alt={alt} loading={loading} decoding="async" className="size-full object-cover" />
            ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                    <TypeIcon aria-hidden="true" className="size-8" />
                </div>
            )}
        </div>
    );
}
