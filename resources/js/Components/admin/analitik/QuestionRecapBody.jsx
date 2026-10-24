import { useState } from 'react';
import { ChartColumn, Table2 } from 'lucide-react';
import { Button, EmptyState } from '@/Components/ui';
import { countWithPercent, formatDecimal, formatNumber, formatPercent } from '@/lib/analitik';
import BarChartView from './BarChartView';
import SimpleTable from './SimpleTable';

function StatGrid({ stats }) {
    const items = [
        ['Rata-rata', stats.mean],
        ['Median', stats.median],
        ['Minimum', stats.min],
        ['Maksimum', stats.max],
    ];

    return (
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {items.map(([label, value]) => (
                <div key={label} className="rounded-md bg-muted p-3">
                    <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
                    <dd className="mt-1 text-xl font-bold tabular-nums text-foreground">{formatDecimal(value)}</dd>
                </div>
            ))}
        </dl>
    );
}

function ToggleableChart({ chart, table }) {
    const [isTableView, setIsTableView] = useState(false);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex justify-end">
                <Button
                    variant="ghost"
                    size="sm"
                    aria-pressed={isTableView}
                    onClick={() => setIsTableView((current) => !current)}
                >
                    {isTableView ? <ChartColumn aria-hidden="true" /> : <Table2 aria-hidden="true" />}
                    {isTableView ? 'Lihat grafik' : 'Lihat tabel'}
                </Button>
            </div>
            {isTableView ? table : chart}
        </div>
    );
}

/** Isi kartu rekap satu pertanyaan sesuai tipe: opsi, rating, angka, atau teks. */
export default function QuestionRecapBody({ recap }) {
    const { question } = recap;

    if (recap.answered_count === 0) {
        return (
            <EmptyState
                icon={ChartColumn}
                title="Belum ada jawaban"
                description="Belum ada jawaban terkirim untuk pertanyaan ini."
                className="py-6"
            />
        );
    }

    if (recap.options) {
        const rows = recap.options;

        return (
            <ToggleableChart
                chart={
                    <BarChartView
                        layout="vertical"
                        ariaLabel={`Grafik batang jawaban: ${question.question_text}`}
                        data={rows.map((row) => ({
                            label: row.label,
                            value: row.count,
                            valueLabel: countWithPercent(row.count, row.percent),
                            tooltip: countWithPercent(row.count, row.percent),
                        }))}
                    />
                }
                table={
                    <SimpleTable
                        caption={`Jawaban: ${question.question_text}`}
                        columns={[
                            { header: 'Opsi', render: (row) => row.label },
                            { header: 'Jumlah', numeric: true, render: (row) => formatNumber(row.count) },
                            { header: 'Persentase', numeric: true, render: (row) => formatPercent(row.percent) },
                        ]}
                        rows={rows}
                    />
                }
            />
        );
    }

    if (recap.distribution) {
        const rows = recap.distribution;

        return (
            <div className="flex flex-col gap-4">
                {recap.stats && <StatGrid stats={recap.stats} />}
                <ToggleableChart
                    chart={
                        <BarChartView
                            ariaLabel={`Grafik batang skor: ${question.question_text}`}
                            data={rows.map((row) => ({ label: String(row.score), value: row.count }))}
                        />
                    }
                    table={
                        <SimpleTable
                            caption={`Distribusi skor: ${question.question_text}`}
                            columns={[
                                { header: 'Skor', render: (row) => row.score },
                                { header: 'Jumlah', numeric: true, render: (row) => formatNumber(row.count) },
                            ]}
                            rows={rows}
                        />
                    }
                />
            </div>
        );
    }

    if (recap.stats) {
        return <StatGrid stats={recap.stats} />;
    }

    if (recap.texts) {
        const remaining = Math.max((recap.texts_total ?? recap.texts.length) - recap.texts.length, 0);

        return (
            <div className="flex flex-col gap-3">
                <ul className="flex flex-col gap-2">
                    {recap.texts.map((text, index) => (
                        <li key={index} className="rounded-md bg-muted px-3 py-2 text-sm text-foreground [overflow-wrap:anywhere]">
                            {text}
                        </li>
                    ))}
                </ul>
                {remaining > 0 && (
                    <p className="text-sm text-muted-foreground tabular-nums">dan {formatNumber(remaining)} jawaban lainnya</p>
                )}
            </div>
        );
    }

    return null;
}
