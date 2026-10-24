import { Button, FieldHint } from '@/Components/ui';
import { cn } from '@/lib/utils';
import { MessageCircle } from 'lucide-react';
import { useId } from 'react';

/**
 * WhatsAppLink — tombol outline yang membuka tautan wa.me di tab baru.
 *
 * URL dibangun di server oleh `App\Services\Support\WhatsAppLinkService`
 * (`buildUrl()` / `buildTemplateUrl()`), lalu dikirim sebagai prop.
 *
 * Props:
 * - `href`         tautan https://wa.me/62…?text=… ; bila kosong tombol dinonaktifkan.
 * - `children`     teks tombol (default "Kirim via WhatsApp").
 * - `disabledHint` teks bantuan saat nomor tidak tersedia.
 * - `size`         ukuran `<Button>` (default "default").
 * - `className`    kelas tambahan untuk pembungkus.
 */
export default function WhatsAppLink({
    href,
    children = 'Kirim via WhatsApp',
    disabledHint = 'Nomor WhatsApp belum tersedia.',
    size = 'default',
    className,
}) {
    const hintId = useId();

    if (!href) {
        return (
            <div className={cn('flex flex-col gap-1', className)}>
                <Button type="button" variant="outline" size={size} disabled aria-describedby={hintId}>
                    <MessageCircle aria-hidden="true" />
                    {children}
                </Button>
                <FieldHint id={hintId}>{disabledHint}</FieldHint>
            </div>
        );
    }

    return (
        <Button asChild variant="outline" size={size} className={className}>
            <a href={href} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden="true" />
                {children}
                <span className="sr-only"> (membuka WhatsApp di tab baru)</span>
            </a>
        </Button>
    );
}
