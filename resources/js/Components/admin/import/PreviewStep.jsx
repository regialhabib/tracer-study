import { useMemo, useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';
import {
    Alert,
    AlertDescription,
    Badge,
    Button,
    Card,
    CardContent,
    EmptyState,
    Select,
    StatCard,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui';

const PAGE_SIZE = 25;
const numberFormatter = new Intl.NumberFormat('id-ID');
const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
});

function formatBirthDate(value) {
    return value ? dateFormatter.format(new Date(`${value}T00:00:00Z`)) : '-';
}

function RowStatusBadge({ status }) {
    return status === 'valid' ? (
        <Badge variant="success" icon={CheckCircle2}>
            Valid
        </Badge>
    ) : (
        <Badge variant="warning" icon={AlertTriangle}>
            Dilewati
        </Badge>
    );
}

/**
 * Langkah 2: ringkasan validasi + tabel baris (filter & paginasi sisi klien).
 *
 * Props:
 * - `preview` { token, filename, summary: {total, valid, dilewati}, rows }
 * - `errors`  galat dari server (mis. token kedaluwarsa)
 */
export default function PreviewStep({ preview, errors = {} }) {
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const form = useForm({ token: preview.token });

    const filteredRows = useMemo(() => {
        if (filter === 'valid') {
            return preview.rows.filter((row) => row.status === 'valid');
        }
        if (filter === 'issues') {
            return preview.rows.filter((row) => row.status !== 'valid');
        }

        return preview.rows;
    }, [filter, preview.rows]);

    const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visibleRows = filteredRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const { summary } = preview;

    const confirm = () => {
        form.post(route('admin.alumni.import.store'), { preserveScroll: true });
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileSpreadsheet aria-hidden="true" className="size-4 shrink-0" />
                <span className="truncate">{preview.filename}</span>
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="Total baris" value={numberFormatter.format(summary.total)} />
                <StatCard
                    label="Siap diimpor"
                    value={numberFormatter.format(summary.valid)}
                    hint="Baris valid"
                    icon={CheckCircle2}
                />
                <StatCard
                    label="Dilewati"
                    value={numberFormatter.format(summary.dilewati)}
                    hint="Perlu diperbaiki di berkas"
                    icon={AlertTriangle}
                />
            </div>

            {(errors.token || errors.file) && (
                <Alert variant="danger">
                    <AlertDescription>{errors.token ?? errors.file}</AlertDescription>
                </Alert>
            )}

            {summary.valid === 0 && (
                <Alert variant="warning">
                    <AlertDescription>
                        Tidak ada baris yang valid. Perbaiki berkas Anda lalu unggah ulang.
                    </AlertDescription>
                </Alert>
            )}

            <Card>
                <CardContent className="space-y-4 pt-4">
                    <div className="sm:max-w-xs">
                        <label htmlFor="row-filter" className="mb-1.5 block text-sm font-medium text-foreground">
                            Tampilkan baris
                        </label>
                        <Select
                            id="row-filter"
                            value={filter}
                            onChange={(event) => {
                                setFilter(event.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="all">Semua ({numberFormatter.format(summary.total)})</option>
                            <option value="valid">Valid ({numberFormatter.format(summary.valid)})</option>
                            <option value="issues">Bermasalah ({numberFormatter.format(summary.dilewati)})</option>
                        </Select>
                    </div>

                    {visibleRows.length === 0 ? (
                        <EmptyState
                            title="Tidak ada baris"
                            description="Tidak ada baris yang cocok dengan filter ini."
                        />
                    ) : (
                        <>
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead numeric>Baris</TableHead>
                                            <TableHead>NISN</TableHead>
                                            <TableHead>Nama</TableHead>
                                            <TableHead>L/P</TableHead>
                                            <TableHead>Angkatan</TableHead>
                                            <TableHead>Peminatan</TableHead>
                                            <TableHead>Tgl. Lahir</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {visibleRows.map((row) => (
                                            <TableRow key={row.row}>
                                                <TableCell numeric>{row.row}</TableCell>
                                                <TableCell className="font-mono">{row.nisn || '-'}</TableCell>
                                                <TableCell>{row.name || '-'}</TableCell>
                                                <TableCell>{row.gender || '-'}</TableCell>
                                                <TableCell>
                                                    {row.entry_year && row.graduation_year
                                                        ? `${row.entry_year}-${row.graduation_year}`
                                                        : '-'}
                                                </TableCell>
                                                <TableCell>{row.major || '-'}</TableCell>
                                                <TableCell>{formatBirthDate(row.birth_date)}</TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <RowStatusBadge status={row.status} />
                                                        {row.reason && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {row.reason}
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <ul className="space-y-3 md:hidden">
                                {visibleRows.map((row) => (
                                    <li key={row.row} className="rounded-lg border border-border p-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-foreground">
                                                    {row.name || '-'}
                                                </p>
                                                <p className="font-mono text-xs text-muted-foreground">
                                                    {row.nisn || '-'} · Baris {row.row}
                                                </p>
                                            </div>
                                            <RowStatusBadge status={row.status} />
                                        </div>
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            {[row.gender, row.major, row.birth_date ? formatBirthDate(row.birth_date) : null]
                                                .filter(Boolean)
                                                .join(' · ')}
                                        </p>
                                        {row.reason && <p className="mt-1 text-xs text-warning">{row.reason}</p>}
                                    </li>
                                ))}
                            </ul>

                            {pageCount > 1 && (
                                <div className="flex items-center justify-between gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={currentPage === 1}
                                        onClick={() => setPage(currentPage - 1)}
                                    >
                                        <ChevronLeft aria-hidden="true" />
                                        Sebelumnya
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        Halaman {currentPage} dari {pageCount}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={currentPage === pageCount}
                                        onClick={() => setPage(currentPage + 1)}
                                    >
                                        Berikutnya
                                        <ChevronRight aria-hidden="true" />
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button asChild variant="outline" size="lg">
                    <Link href={route('admin.alumni.import.create')}>Unggah Ulang</Link>
                </Button>
                <Button
                    size="lg"
                    onClick={confirm}
                    loading={form.processing}
                    loadingText="Menyimpan..."
                    disabled={summary.valid === 0}
                >
                    Impor {numberFormatter.format(summary.valid)} Alumni
                </Button>
            </div>
        </div>
    );
}
