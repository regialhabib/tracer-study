import { Link } from '@inertiajs/react';
import { Download, FileText, ListChecks } from 'lucide-react';
import { Button } from '@/Components/ui';
import { cleanFilters } from '@/lib/analitik';

/**
 * Tombol di header analitik; tiap tombol hanya tampil bila route-nya terdaftar.
 *
 * Props: `filters`, `current` ('index' | 'pertanyaan'; tombol halaman aktif disembunyikan), `disabled`.
 */
export default function ExportActions({ filters, current = 'index', disabled = false }) {
    if (disabled) {
        return null;
    }

    const query = cleanFilters(filters);

    return (
        <>
            {current === 'index' && route().has('admin.analitik.pertanyaan') && (
                <Button variant="outline" asChild>
                    <Link href={route('admin.analitik.pertanyaan', query)}>
                        <ListChecks aria-hidden="true" />
                        Rekap per pertanyaan
                    </Link>
                </Button>
            )}
            {current === 'pertanyaan' && route().has('admin.analitik.index') && (
                <Button variant="outline" asChild>
                    <Link href={route('admin.analitik.index', query)}>Kembali ke ringkasan</Link>
                </Button>
            )}
            {route().has('admin.analitik.ekspor.jawaban') && (
                <Button variant="outline" asChild>
                    <a href={route('admin.analitik.ekspor.jawaban', query)}>
                        <Download aria-hidden="true" />
                        Unduh Excel
                    </a>
                </Button>
            )}
            {route().has('admin.analitik.ekspor.laporan') && (
                <Button asChild>
                    <a href={route('admin.analitik.ekspor.laporan', query)}>
                        <FileText aria-hidden="true" />
                        Unduh PDF
                    </a>
                </Button>
            )}
        </>
    );
}
