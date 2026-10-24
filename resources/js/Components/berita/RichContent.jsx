import { cn } from '@/lib/utils';

const HTML_TAG_PATTERN = /<\/?[a-z][\s\S]*?>/i;

function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Data lama berupa teks polos: pecah per paragraf (baris kosong) dan baris tunggal jadi <br>.
 */
function plainTextToHtml(text) {
    return text
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
        .join('');
}

/**
 * RichContent — render isi berita (HTML yang sudah disanitasi server) dengan gaya `.rich-content`.
 *
 * Props:
 * - `html`      string HTML (atau teks polos dari data lama).
 * - `className`
 */
export default function RichContent({ html, className }) {
    const source = html ?? '';
    const safeHtml = HTML_TAG_PATTERN.test(source) ? source : plainTextToHtml(source);

    return <div className={cn('rich-content', className)} dangerouslySetInnerHTML={{ __html: safeHtml }} />;
}
