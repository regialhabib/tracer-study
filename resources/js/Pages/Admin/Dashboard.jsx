import { Head, Link } from '@inertiajs/react';
import { CalendarDays, ChartColumn, CircleCheck, ClipboardList, MailOpen, ShieldCheck, UserCheck, Users } from 'lucide-react';
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
import BarChartView from '@/Components/admin/analitik/BarChartView';
import ChartCard from '@/Components/admin/analitik/ChartCard';
import SimpleTable from '@/Components/admin/analitik/SimpleTable';
import {
    countWithPercent,
    formatDate,
    formatNumber,
    formatPercent,
    statusBgClass,
    statusColor,
} from '@/lib/analitik';
import { ALUMNI_STATUS_LABELS, labelFor } from '@/lib/labels';
import { cn } from '@/lib/utils';

function StatusBadge({ statusKey }) {
    if (!statusKey) {
        return <span className="text-muted-foreground">–</span>;
    }

    return (
        <Badge variant="neutral">
            <span aria-hidden="true" className={cn('size-2 rounded-full', statusBgClass(statusKey))} />
            {labelFor(ALUMNI_STATUS_LABELS, statusKey, 'Lainnya')}
        </Badge>
    );
}

function ActiveKuesionerCard({ kuesioner }) {
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

    const summary = kuesioner.summary ?? {};
    const rate = Number(summary.response_rate) || 0;
    const endDate = formatDate(kuesioner.end_date);
    const responseSummary = `${formatNumber(summary.submitted_count)} dari ${formatNumber(summary.target_count)} alumni`;
    const analitikAvailable = route().has('admin.analitik.index');

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
                {endDate && (
                    <div className="flex items-start gap-3">
                        <CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Ditutup pada</p>
                            <p className="text-sm font-semibold text-foreground">{endDate}</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <div className="flex items-baseline justify-between gap-3">
                        <p className="text-sm font-medium text-muted-foreground">Response rate</p>
                        <p className="text-sm font-semibold tabular-nums text-foreground">{formatPercent(rate)}</p>
                    </div>
                    <Progress
                        value={rate}
                        label="Response rate kuesioner"
                        valueText={`${formatPercent(rate)}, ${responseSummary}`}
                        className="h-2"
                    />
                    <p className="text-xs tabular-nums text-muted-foreground">{responseSummary} telah mengirim jawaban</p>
                </div>

                {analitikAvailable && (
                    <Button asChild className="w-full sm:w-auto sm:self-start">
                        <Link href={route('admin.analitik.index', { kuesioner: kuesioner.id })}>
                            <ChartColumn aria-hidden="true" />
                            Lihat analitik
                        </Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

function StatusDistributionCard({ statusDistribution }) {
    const rows = statusDistribution ?? [];
    const total = rows.reduce((sum, row) => sum + (Number(row.count) || 0), 0);

    return (
        <ChartCard
            title="Distribusi Status Kegiatan"
            description={`Kegiatan alumni aktif setelah lulus${total > 0 ? ` · ${formatNumber(total)} alumni` : ''}`}
            isEmpty={total === 0}
            emptyText="Distribusi akan tampil setelah alumni melengkapi profil."
            className="lg:col-span-3"
            table={
                <SimpleTable
                    caption="Distribusi status kegiatan alumni"
                    columns={[
                        { header: 'Status kegiatan', render: (row) => row.label },
                        { header: 'Jumlah alumni', numeric: true, render: (row) => formatNumber(row.count) },
                        { header: 'Persentase', numeric: true, render: (row) => formatPercent(row.percent) },
                    ]}
                    rows={rows}
                />
            }
        >
            <BarChartView
                layout="vertical"
                ariaLabel="Grafik batang distribusi status kegiatan alumni"
                data={rows.map((row) => ({
                    label: row.label,
                    value: row.count,
                    valueLabel: countWithPercent(row.count, row.percent),
                    tooltip: countWithPercent(row.count, row.percent),
                    color: statusColor(row.value),
                }))}
            />
        </ChartCard>
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
                                    <TableHead>Angkatan</TableHead>
                                    <TableHead>Status kegiatan</TableHead>
                                    <TableHead>Terdaftar</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentAlumni.map((alumni) => (
                                    <TableRow key={alumni.id}>
                                        <TableCell>
                                            <AlumniIdentity alumni={alumni} />
                                        </TableCell>
                                        <TableCell className="tabular-nums">{alumni.graduation_year || '–'}</TableCell>
                                        <TableCell>
                                            <StatusBadge statusKey={alumni.current_status} />
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {formatDate(alumni.created_at) ?? '–'}
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
                                            <dt className="text-xs font-medium text-muted-foreground">Angkatan</dt>
                                            <dd className="tabular-nums text-foreground">{alumni.graduation_year || '–'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs font-medium text-muted-foreground">Terdaftar</dt>
                                            <dd className="text-foreground">{formatDate(alumni.created_at) ?? '–'}</dd>
                                        </div>
                                    </dl>
                                    <div>
                                        <StatusBadge statusKey={alumni.current_status} />
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

export default function AdminDashboard({ stats = {}, activeKuesioner = null, statusDistribution = [], recentAlumni = [] }) {
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
                        label="Alumni aktif"
                        value={formatNumber(stats.active_alumni)}
                        hint="Akun sudah terverifikasi"
                        icon={UserCheck}
                    />
                    <StatCard
                        label="Menunggu verifikasi"
                        value={formatNumber(stats.pending_verifications)}
                        hint="Perlu ditinjau admin"
                        icon={ShieldCheck}
                    />
                    <StatCard
                        label="Pesan belum dibaca"
                        value={formatNumber(stats.unread_messages)}
                        hint="Dari alumni"
                        icon={MailOpen}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-5">
                    <ActiveKuesionerCard kuesioner={activeKuesioner} />
                    <StatusDistributionCard statusDistribution={statusDistribution} />
                </div>

                <RecentAlumniSection recentAlumni={recentAlumni ?? []} />
            </div>
        </AdminLayout>
    );
}
