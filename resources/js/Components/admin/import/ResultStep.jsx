import { Link } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Download, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle, Button, Card, CardContent, StatCard } from '@/Components/ui';

const numberFormatter = new Intl.NumberFormat('id-ID');

/**
 * Langkah 3: ringkasan berhasil/dilewati/gagal, unduh laporan, dan tautan lanjutan.
 *
 * Props:
 * - `result` { token, berhasil, dilewati, gagal, errorMessage }
 */
export default function ResultStep({ result }) {
    const hasFailed = result.gagal > 0 || Boolean(result.errorMessage);

    return (
        <div className="space-y-4 md:space-y-6">
            {hasFailed ? (
                <Alert variant="danger">
                    <AlertTitle>Import dibatalkan</AlertTitle>
                    <AlertDescription>
                        {result.errorMessage ?? 'Terjadi kesalahan saat menyimpan data. Tidak ada data yang tersimpan.'}
                    </AlertDescription>
                </Alert>
            ) : (
                <Alert variant="success">
                    <AlertTitle>Import selesai</AlertTitle>
                    <AlertDescription>
                        {numberFormatter.format(result.berhasil)} akun alumni berhasil dibuat. Kata sandi awal adalah
                        tanggal lahir (ddmmyyyy) atau NISN bila tanggal lahir kosong; alumni wajib menggantinya saat
                        login pertama.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="Berhasil" value={numberFormatter.format(result.berhasil)} icon={CheckCircle2} />
                <StatCard label="Dilewati" value={numberFormatter.format(result.dilewati)} icon={AlertTriangle} />
                <StatCard label="Gagal" value={numberFormatter.format(result.gagal)} icon={XCircle} />
            </div>

            <Card>
                <CardContent className="flex flex-col gap-2 pt-4 sm:flex-row sm:justify-end">
                    {!hasFailed && (
                        <Button asChild variant="outline" size="lg">
                            <a href={route('admin.alumni.import.report', result.token)}>
                                <Download aria-hidden="true" />
                                Unduh Laporan
                            </a>
                        </Button>
                    )}
                    <Button asChild variant={hasFailed ? 'default' : 'outline'} size="lg">
                        <Link href={route('admin.alumni.import.create')}>
                            {hasFailed ? 'Coba Lagi' : 'Import Berkas Lain'}
                        </Link>
                    </Button>
                    {route().has('admin.alumni.index') && (
                        <Button asChild size="lg">
                            <Link href={route('admin.alumni.index')}>Lihat Daftar Alumni</Link>
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
