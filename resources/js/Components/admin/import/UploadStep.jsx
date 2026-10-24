import { useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Download, FileSpreadsheet, UploadCloud, X } from 'lucide-react';
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    FieldError,
    FieldHint,
} from '@/Components/ui';
import { cn } from '@/lib/utils';

function formatFileSize(bytes) {
    if (bytes >= 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toLocaleString('id-ID', { maximumFractionDigits: 1 })} MB`;
    }

    return `${Math.max(1, Math.round(bytes / 1024)).toLocaleString('id-ID')} KB`;
}

/**
 * Langkah 1: unduh templat dan unggah berkas .xlsx/.csv.
 *
 * Props:
 * - `limits` { maxRows, maxSizeMb }
 */
export default function UploadStep({ limits }) {
    const inputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const form = useForm({ file: null });

    const chooseFile = (file) => {
        form.setData('file', file ?? null);
        form.clearErrors();
    };

    const submit = (event) => {
        event.preventDefault();
        form.post(route('admin.alumni.import.preview'), { forceFormData: true });
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);
        chooseFile(event.dataTransfer.files?.[0]);
    };

    return (
        <div className="grid gap-4 lg:grid-cols-[1fr_20rem] lg:gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Unggah Berkas Alumni</CardTitle>
                    <CardDescription>
                        Format .xlsx atau .csv, maksimal {limits.maxSizeMb} MB dan{' '}
                        {limits.maxRows.toLocaleString('id-ID')} baris data.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-4" noValidate>
                        <div
                            onDragOver={(event) => {
                                event.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            className={cn(
                                'flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-4 py-10 text-center transition-colors',
                                isDragging ? 'border-primary bg-primary-soft' : 'border-border bg-muted/40',
                                form.errors.file && 'border-danger',
                            )}
                        >
                            {form.data.file ? (
                                <div className="flex w-full max-w-sm items-center gap-3 rounded-md border border-border bg-card p-3 text-left">
                                    <FileSpreadsheet aria-hidden="true" className="size-8 shrink-0 text-primary" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-foreground">
                                            {form.data.file.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatFileSize(form.data.file.size)}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Hapus berkas terpilih"
                                        onClick={() => {
                                            chooseFile(null);
                                            if (inputRef.current) {
                                                inputRef.current.value = '';
                                            }
                                        }}
                                    >
                                        <X aria-hidden="true" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <UploadCloud aria-hidden="true" className="size-10 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">Tarik berkas ke sini</p>
                                        <p className="text-sm text-muted-foreground">atau pilih dari perangkat Anda</p>
                                    </div>
                                </>
                            )}
                            <input
                                ref={inputRef}
                                id="import-file"
                                type="file"
                                accept=".xlsx,.csv"
                                className="sr-only"
                                onChange={(event) => chooseFile(event.target.files?.[0])}
                            />
                            <Button type="button" variant="outline" size="lg" onClick={() => inputRef.current?.click()}>
                                {form.data.file ? 'Ganti Berkas' : 'Pilih Berkas'}
                            </Button>
                        </div>

                        <FieldError message={form.errors.file} />
                        <FieldHint>Data belum disimpan. Anda akan melihat pratinjau terlebih dahulu.</FieldHint>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full sm:w-auto"
                            loading={form.processing}
                            loadingText="Memeriksa berkas..."
                            disabled={!form.data.file}
                        >
                            Periksa Berkas
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Belum punya templat?</CardTitle>
                    <CardDescription>
                        Gunakan templat resmi agar kolom sesuai. Sheet &ldquo;Petunjuk&rdquo; menjelaskan cara
                        pengisian.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button asChild variant="outline" size="lg" className="w-full">
                        <a href={route('admin.alumni.import.template')}>
                            <Download aria-hidden="true" />
                            Unduh Templat Excel
                        </a>
                    </Button>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        <li>NISN 10 digit, belum terdaftar.</li>
                        <li>Kata sandi awal: tanggal lahir (ddmmyyyy), atau NISN bila kosong.</li>
                        <li>Alumni wajib mengganti kata sandi saat login pertama.</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
