import { Head } from '@inertiajs/react';
import { ChartColumn } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Badge, Card, EmptyState, PageHeader, StatCard } from '@/Components/ui';
import BarChartView from '@/Components/admin/analitik/BarChartView';
import ChartCard from '@/Components/admin/analitik/ChartCard';
import ExportActions from '@/Components/admin/analitik/ExportActions';
import FilterBar from '@/Components/admin/analitik/FilterBar';
import NonRespondentsCard from '@/Components/admin/analitik/NonRespondentsCard';
import SimpleTable from '@/Components/admin/analitik/SimpleTable';
import {
    chartColor,
    countWithPercent,
    formatDate,
    formatDecimal,
    formatNumber,
    formatPercent,
    statusColor,
} from '@/lib/analitik';
import { KUESIONER_STATUS_BADGE_VARIANTS, KUESIONER_STATUS_LABELS, METRIC_KEY_LABELS } from '@/lib/kuesioner';

const countPercentColumns = (firstHeader) => [
    { header: firstHeader, render: (row) => row.label },
    { header: 'Jumlah', numeric: true, render: (row) => formatNumber(row.count) },
    { header: 'Persentase', numeric: true, render: (row) => formatPercent(row.percent) },
];

function CountDistributionCard({ title, description, items, metricKey, ariaLabel, firstHeader, layout, colorOf }) {
    const rows = items ?? [];
    const total = rows.reduce((sum, row) => sum + (Number(row.count) || 0), 0);
    const chartData = rows.map((row) => ({
        label: row.label,
        value: row.count,
        valueLabel: countWithPercent(row.count, row.percent),
        tooltip: countWithPercent(row.count, row.percent),
        color: colorOf?.(row),
    }));

    return (
        <ChartCard
            title={title}
            description={description}
            unavailableLabel={items === null ? METRIC_KEY_LABELS[metricKey] : undefined}
            isEmpty={total === 0}
            table={<SimpleTable caption={ariaLabel} columns={countPercentColumns(firstHeader)} rows={rows} />}
        >
            <BarChartView data={chartData} layout={layout} ariaLabel={ariaLabel} />
        </ChartCard>
    );
}

export default function AnalitikIndex({
    filters,
    filterOptions,
    kuesioner,
    summary,
    responseRateByAngkatan,
    statusDistribution,
    masaTunggu,
    pendapatan,
    topLembaga,
    relevansiIlmu,
    nonRespondents,
}) {
    const hasKuesioner = Boolean(kuesioner);
    const period = hasKuesioner
        ? `${formatDate(kuesioner.start_date) ?? '–'} – ${formatDate(kuesioner.end_date) ?? '–'}`
        : null;

    const angkatanRows = (responseRateByAngkatan ?? []).map((row) => ({
        ...row,
        label: String(row.angkatan),
    }));

    return (
        <AdminLayout
            title="Analitik"
            header={
                <PageHeader
                    title="Analitik Tracer Study"
                    description={
                        hasKuesioner
                            ? 'Pantau partisipasi dan kegiatan alumni berdasarkan jawaban kuesioner.'
                            : 'Ringkasan jawaban kuesioner alumni akan tampil di sini.'
                    }
                    actions={<ExportActions filters={filters} current="index" disabled={!hasKuesioner} />}
                />
            }
        >
            <Head title="Analitik" />

            {!hasKuesioner ? (
                <Card>
                    <EmptyState
                        icon={ChartColumn}
                        title="Belum ada kuesioner"
                        description="Buat dan aktifkan kuesioner agar analitik jawaban alumni dapat ditampilkan."
                    />
                </Card>
            ) : (
                <div className="flex flex-col gap-4 md:gap-6">
                    <FilterBar routeName="admin.analitik.index" filters={filters} filterOptions={filterOptions} />

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <Badge variant={KUESIONER_STATUS_BADGE_VARIANTS[kuesioner.status] ?? 'neutral'}>
                            {KUESIONER_STATUS_LABELS[kuesioner.status] ?? kuesioner.status}
                        </Badge>
                        <span className="font-semibold text-foreground">{kuesioner.title}</span>
                        <span className="tabular-nums">Periode {period}</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
                        <StatCard label="Alumni target" value={formatNumber(summary?.target_count)} hint="Sesuai filter" />
                        <StatCard
                            label="Sudah mengirim"
                            value={formatNumber(summary?.submitted_count)}
                            hint="Jawaban terkirim"
                        />
                        <StatCard
                            label="Response rate"
                            value={formatPercent(summary?.response_rate)}
                            hint="Terkirim dibanding target"
                        />
                        <StatCard
                            label="Masih draf"
                            value={formatNumber(summary?.draft_count)}
                            hint="Belum dikirim, tidak dihitung"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
                        <ChartCard
                            title="Response rate per angkatan"
                            description="Persentase alumni target yang sudah mengirim jawaban."
                            isEmpty={angkatanRows.length === 0}
                            table={
                                <SimpleTable
                                    caption="Response rate per angkatan"
                                    columns={[
                                        { header: 'Angkatan', render: (row) => row.angkatan },
                                        { header: 'Target', numeric: true, render: (row) => formatNumber(row.target) },
                                        { header: 'Terkirim', numeric: true, render: (row) => formatNumber(row.submitted) },
                                        { header: 'Response rate', numeric: true, render: (row) => formatPercent(row.rate) },
                                    ]}
                                    rows={angkatanRows}
                                />
                            }
                        >
                            <BarChartView
                                data={angkatanRows.map((row) => ({
                                    label: row.label,
                                    value: row.rate,
                                    valueLabel: formatPercent(row.rate),
                                    tooltip: `${formatPercent(row.rate)} (${formatNumber(row.submitted)} dari ${formatNumber(row.target)})`,
                                }))}
                                domain={[0, 100]}
                                seriesName="Response rate"
                                ariaLabel="Grafik batang response rate per angkatan"
                            />
                        </ChartCard>

                        <CountDistributionCard
                            title="Status kegiatan"
                            description="Kegiatan alumni setelah lulus menurut jawaban kuesioner."
                            items={statusDistribution}
                            metricKey="status_kegiatan"
                            firstHeader="Status kegiatan"
                            ariaLabel="Grafik batang distribusi status kegiatan alumni"
                            layout="vertical"
                            colorOf={(row) => statusColor(row.value)}
                        />

                        <ChartCard
                            title="Masa tunggu kerja"
                            description="Lama alumni menunggu hingga mendapat pekerjaan pertama."
                            unavailableLabel={masaTunggu === null ? METRIC_KEY_LABELS.masa_tunggu_bulan : undefined}
                            isEmpty={!masaTunggu || masaTunggu.count === 0}
                            table={
                                masaTunggu && (
                                    <SimpleTable
                                        caption="Distribusi masa tunggu"
                                        columns={[
                                            { header: 'Masa tunggu', render: (row) => row.label },
                                            { header: 'Jumlah', numeric: true, render: (row) => formatNumber(row.count) },
                                        ]}
                                        rows={masaTunggu.distribution ?? []}
                                    />
                                )
                            }
                            summary={
                                masaTunggu && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <StatCard
                                            label="Rata-rata"
                                            value={`${formatDecimal(masaTunggu.mean)} bln`}
                                            hint={`${formatNumber(masaTunggu.count)} responden`}
                                        />
                                        <StatCard label="Median" value={`${formatDecimal(masaTunggu.median)} bln`} />
                                    </div>
                                )
                            }
                        >
                            <BarChartView
                                data={(masaTunggu?.distribution ?? []).map((row) => ({ label: row.label, value: row.count }))}
                                ariaLabel="Grafik batang distribusi masa tunggu"
                            />
                        </ChartCard>

                        <CountDistributionCard
                            title="Rentang pendapatan"
                            description="Hanya alumni yang bekerja atau berwirausaha."
                            items={pendapatan}
                            metricKey="rentang_pendapatan"
                            firstHeader="Rentang pendapatan"
                            ariaLabel="Grafik batang distribusi rentang pendapatan"
                            layout="vertical"
                        />

                        <ChartCard
                            title="Kampus dan tempat kerja terbanyak"
                            description="Lembaga yang paling banyak disebut alumni."
                            unavailableLabel={topLembaga === null ? METRIC_KEY_LABELS.nama_lembaga : undefined}
                            isEmpty={(topLembaga ?? []).length === 0}
                            table={
                                <SimpleTable
                                    caption="Daftar lembaga terbanyak"
                                    columns={[
                                        { header: 'Nama lembaga', render: (row) => row.name },
                                        { header: 'Jumlah alumni', numeric: true, render: (row) => formatNumber(row.count) },
                                    ]}
                                    rows={topLembaga ?? []}
                                />
                            }
                        >
                            <BarChartView
                                data={(topLembaga ?? []).map((row) => ({ label: row.name, value: row.count, tooltip: undefined }))}
                                layout="vertical"
                                ariaLabel="Grafik batang lembaga terbanyak"
                            />
                        </ChartCard>

                        <ChartCard
                            title="Relevansi ilmu pesantren"
                            description="Skor 1 (tidak relevan) sampai 5 (sangat relevan)."
                            unavailableLabel={relevansiIlmu === null ? METRIC_KEY_LABELS.relevansi_ilmu : undefined}
                            isEmpty={!relevansiIlmu || relevansiIlmu.count === 0}
                            table={
                                relevansiIlmu && (
                                    <SimpleTable
                                        caption="Distribusi skor relevansi ilmu"
                                        columns={[
                                            { header: 'Skor', render: (row) => row.score },
                                            { header: 'Jumlah', numeric: true, render: (row) => formatNumber(row.count) },
                                        ]}
                                        rows={relevansiIlmu.distribution ?? []}
                                    />
                                )
                            }
                            summary={
                                relevansiIlmu && (
                                    <StatCard
                                        label="Rata-rata skor"
                                        value={`${formatDecimal(relevansiIlmu.mean)} / 5`}
                                        hint={`${formatNumber(relevansiIlmu.count)} responden`}
                                    />
                                )
                            }
                        >
                            <BarChartView
                                data={(relevansiIlmu?.distribution ?? []).map((row) => ({
                                    label: String(row.score),
                                    value: row.count,
                                }))}
                                color={chartColor(1)}
                                ariaLabel="Grafik batang distribusi skor relevansi ilmu"
                            />
                        </ChartCard>
                    </div>

                    <NonRespondentsCard nonRespondents={nonRespondents} filters={filters} />
                </div>
            )}
        </AdminLayout>
    );
}
