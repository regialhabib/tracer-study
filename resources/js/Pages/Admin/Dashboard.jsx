import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    CalendarDays,
    ChartColumn,
    CircleCheck,
    ClipboardList,
    ListChecks,
    MessageSquare,
    Newspaper,
    Table2,
    Users,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { initialsFromName } from '@/Layouts/Partials/navigation';
import {
    Avatar,
    AvatarFallback,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    EmptyState,
    PageHeader,
    Progress,
    StatCard,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui';
import { cn } from '@/lib/utils';

/**
 * Status kegiatan alumni dalam urutan tetap palet grafik (DESIGN.md §2.3).
 * Kelas ditulis lengkap agar terdeteksi Tailwind JIT.
 */
const STATUS_OPTIONS = [
    { key: 'pengabdian', label: 'Pengabdian / Khidmah', colorClass: 'bg-chart-1' },
    { key: 'kuliah_islam', label: 'Kuliah Keislaman', colorClass: 'bg-chart-2' },
    { key: 'kuliah_umum', label: 'Kuliah Umum', colorClass: 'bg-chart-3' },
    { key: 'bekerja', label: 'Bekerja', colorClass: 'bg-chart-4' },
    { key: 'wirausaha', label: 'Wirausaha', colorClass: 'bg-chart-5' },
    { key: 'mencari_kerja', label: 'Mencari Kerja', colorClass: 'bg-chart-6' },
    { key: 'lainnya', label: 'Lainnya', colorClass: 'bg-chart-7' },
];

const FALLBACK_STATUS = STATUS_OPTIONS[STATUS_OPTIONS.length - 1];

const numberFormatter = new Intl.NumberFormat('id-ID');
const percentFormatter = new Intl.NumberFormat('id-ID', { style: 'percent', maximumFractionDigits: 1 });
const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
});

function formatNumber(value) {
    return numberFormatter.format(Number(value) || 0);
}

/** `ratio` berupa pecahan 0–1, mis. 0.625 → "62,5%". */
function formatPercent(ratio) {
    return percentFormatter.format(Number(ratio) || 0);
}

function formatDate(value) {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : dateFormatter.format(date);
}

function findStatus(statusKey) {
    return STATUS_OPTIONS.find((status) => status.key === statusKey) ?? FALLBACK_STATUS;
}

/** Menggabungkan `statusBreakdown` ke urutan tetap; kunci tak dikenal masuk "Lainnya". */
function buildStatusRows(statusBreakdown) {
    const counts = Object.fromEntries(STATUS_OPTIONS.map((status) => [status.key, 0]));

    Object.entries(statusBreakdown ?? {}).forEach(([statusKey, count]) => {
        counts[findStatus(statusKey).key] += Number(count) || 0;
    });

    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

    return {
        total,
        rows: STATUS_OPTIONS.map((status) => ({
            ...status,
            count: counts[status.key],
            ratio: total > 0 ? counts[status.key] / total : 0,
        })),
    };
}

function StatusBadge({ statusKey }) {
    if (!statusKey) {
        return <span className="text-muted-foreground">–</span>;
    }

    const status = findStatus(statusKey);

    return (
        <Badge variant="neutral">
            <span aria-hidden="true" className={cn('size-2 rounded-full', status.colorClass)} />
            {status.label}
        </Badge>
    );
}

function ActiveKuesionerCard({ kuesioner, stats }) {
    if (!kuesioner) {
        return (
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Kuesioner aktif</CardTitle>
                </CardHeader>
                <CardContent>
                    <EmptyState
                        icon={ClipboardList}
                        title="Belum ada kuesioner aktif"
                        description="Kuesioner yang sedang dibuka untuk alumni akan tampil di sini."
                        className="py-6"
                    />
                </CardContent>
            </Card>
        );
    }

    const startDate = formatDate(kuesioner.start_date);
    const endDate = formatDate(kuesioner.end_date);
    const period = startDate && endDate ? `${startDate} – ${endDate}` : (startDate ?? endDate ?? 'Belum ditentukan');
    const responseRatio = (Number(stats.response_rate) || 0) / 100;
    const responseSummary = `${formatNumber(stats.total_responses)} dari ${formatNumber(stats.total_alumni)} alumni`;

    return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <div className="flex items-start justify-between gap-3">
                    <CardTitle>Kuesioner aktif</CardTitle>
                    <Badge variant="success" icon={CircleCheck}>
                        Berjalan
                    </Badge>
                </div>
                <CardDescription className="text-base font-semibold text-foreground">{kuesioner.title}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                        <CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div>
                            <dt className="text-xs font-medium text-muted-foreground">Periode</dt>
                            <dd className="text-sm font-semibold text-foreground">{period}</dd>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <ListChecks aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div>
                            <dt className="text-xs font-medium text-muted-foreground">Jumlah pertanyaan</dt>
                            <dd className="text-sm font-semibold tabular-nums text-foreground">
                                {formatNumber(kuesioner.pertanyaan_count)} pertanyaan
                            </dd>
                        </div>
                    </div>
                </dl>

                <div className="flex flex-col gap-2">
                    <div className="flex items-baseline justify-between gap-3">
                        <p className="text-sm font-medium text-muted-foreground">Response rate</p>
                        <p className="text-sm font-semibold tabular-nums text-foreground">{formatPercent(responseRatio)}</p>
                    </div>
                    <Progress
                        value={responseRatio * 100}
                        label="Response rate kuesioner"
                        valueText={`${formatPercent(responseRatio)}, ${responseSummary}`}
                        className="h-2"
                    />
                    <p className="text-xs text-muted-foreground tabular-nums">{responseSummary} telah mengisi</p>
                </div>
            </CardContent>
        </Card>
    );
}

function StatusDistributionCard({ statusBreakdown }) {
    const [isTableView, setIsTableView] = useState(false);
    const { total, rows } = buildStatusRows(statusBreakdown);

    return (
        <Card className="lg:col-span-3">
            <CardHeader>
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                        <CardTitle>Distribusi Status Kegiatan</CardTitle>
                        <CardDescription>
                            Kegiatan alumni setelah lulus
                            {total > 0 && <span className="tabular-nums"> · {formatNumber(total)} alumni</span>}
                        </CardDescription>
                    </div>
                    {total > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            aria-pressed={isTableView}
                            onClick={() => setIsTableView((current) => !current)}
                            className="shrink-0"
                        >
                            {isTableView ? <ChartColumn aria-hidden="true" /> : <Table2 aria-hidden="true" />}
                            {isTableView ? 'Lihat sebagai grafik' : 'Lihat sebagai tabel'}
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {total === 0 ? (
                    <EmptyState
                        icon={ChartColumn}
                        title="Belum ada data status"
                        description="Distribusi akan tampil setelah alumni melengkapi profil."
                        className="py-6"
                    />
                ) : isTableView ? (
                    <Table containerClassName="rounded-md border border-border">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Status kegiatan</TableHead>
                                <TableHead numeric>Jumlah alumni</TableHead>
                                <TableHead numeric>Persentase</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow key={row.key}>
                                    <TableCell className="font-medium">{row.label}</TableCell>
                                    <TableCell numeric>{formatNumber(row.count)}</TableCell>
                                    <TableCell numeric>{formatPercent(row.ratio)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <ul className="flex flex-col gap-4">
                        {rows.map((row) => (
                            <li key={row.key} className="flex flex-col gap-1.5">
                                <div className="flex items-baseline justify-between gap-3 text-sm">
                                    <span className="font-medium text-foreground">{row.label}</span>
                                    <span className="shrink-0 tabular-nums text-muted-foreground">
                                        <span className="font-semibold text-foreground">{formatNumber(row.count)}</span>
                                        {' · '}
                                        {formatPercent(row.ratio)}
                                    </span>
                                </div>
                                <div aria-hidden="true" className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                    <div
                                        className={cn('h-full rounded-full', row.colorClass)}
                                        style={{ width: `${row.ratio * 100}%` }}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}

function AlumniIdentity({ alumni }) {
    return (
        <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-8">
                <AvatarFallback className="text-xs">{initialsFromName(alumni.name)}</AvatarFallback>
            </Avatar>
            <span className="truncate font-semibold text-foreground">{alumni.name}</span>
        </div>
    );
}

function RecentAlumniSection({ recentAlumni }) {
    const alumniIndexAvailable = route().has('admin.alumni.index');

    return (
        <section aria-labelledby="alumni-terbaru-heading" className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
                <h2 id="alumni-terbaru-heading" className="text-lg font-semibold text-foreground">
                    Alumni Terbaru
                </h2>
                {alumniIndexAvailable && recentAlumni.length > 0 && (
                    <Button variant="link" asChild>
                        <Link href={route('admin.alumni.index')}>Lihat semua</Link>
                    </Button>
                )}
            </div>

            {recentAlumni.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={Users}
                        title="Belum ada alumni"
                        description="Alumni yang baru terdaftar akan tampil di sini."
                    />
                </Card>
            ) : (
                <>
                    <Card className="hidden overflow-hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>NISN</TableHead>
                                    <TableHead>Angkatan</TableHead>
                                    <TableHead>Status kegiatan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentAlumni.map((alumni) => (
                                    <TableRow key={alumni.id}>
                                        <TableCell>
                                            <AlumniIdentity alumni={alumni} />
                                        </TableCell>
                                        <TableCell className="font-mono text-[13px] text-muted-foreground">
                                            {alumni.nisn || '–'}
                                        </TableCell>
                                        <TableCell className="tabular-nums">
                                            {alumni.profile?.graduation_year || '–'}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge statusKey={alumni.profile?.current_status} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>

                    <ul className="flex flex-col gap-3 md:hidden">
                        {recentAlumni.map((alumni) => (
                            <li key={alumni.id}>
                                <Card className="flex flex-col gap-3 p-4">
                                    <AlumniIdentity alumni={alumni} />
                                    <dl className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <dt className="text-xs font-medium text-muted-foreground">NISN</dt>
                                            <dd className="font-mono text-[13px] text-foreground">{alumni.nisn || '–'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs font-medium text-muted-foreground">Angkatan</dt>
                                            <dd className="tabular-nums text-foreground">
                                                {alumni.profile?.graduation_year || '–'}
                                            </dd>
                                        </div>
                                    </dl>
                                    <div>
                                        <StatusBadge statusKey={alumni.profile?.current_status} />
                                    </div>
                                </Card>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </section>
    );
}

export default function AdminDashboard({ stats, activeKuesioner, recentAlumni = [], statusBreakdown = {} }) {
    const responseRatio = (Number(stats.response_rate) || 0) / 100;

    return (
        <AdminLayout
            title="Ringkasan"
            header={
                <PageHeader
                    title="Ringkasan Tracer Study"
                    description="Pantau partisipasi alumni, kuesioner yang berjalan, dan kegiatan alumni setelah lulus."
                />
            }
        >
            <Head title="Ringkasan" />

            <div className="flex flex-col gap-4 md:gap-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
                    <StatCard
                        label="Total alumni"
                        value={formatNumber(stats.total_alumni)}
                        hint="Alumni terdaftar"
                        icon={Users}
                    />
                    <StatCard
                        label="Response rate"
                        value={formatPercent(responseRatio)}
                        hint={`${formatNumber(stats.total_responses)} dari ${formatNumber(stats.total_alumni)} alumni`}
                        icon={ChartColumn}
                    />
                    <StatCard
                        label="Kabar terbit"
                        value={formatNumber(stats.total_berita)}
                        hint="Kabar, agenda & info"
                        icon={Newspaper}
                    />
                    <StatCard
                        label="Percakapan"
                        value={formatNumber(stats.total_conversations)}
                        hint="Pesan alumni & admin"
                        icon={MessageSquare}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-5">
                    <ActiveKuesionerCard kuesioner={activeKuesioner} stats={stats} />
                    <StatusDistributionCard statusBreakdown={statusBreakdown} />
                </div>

                <RecentAlumniSection recentAlumni={recentAlumni ?? []} />
            </div>
        </AdminLayout>
    );
}
