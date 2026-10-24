import { useState } from 'react';
import { ChartColumn, Info, Table2 } from 'lucide-react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState } from '@/Components/ui';
import { cn } from '@/lib/utils';

/**
 * Kartu grafik dengan tombol "Lihat tabel" (tabel aksesibel).
 *
 * Props:
 * - `title`, `description`
 * - `unavailableLabel` bila diisi, metrik tidak tersedia: tampilkan pesan "belum punya pertanyaan dengan kunci …".
 * - `isEmpty`          data kosong → EmptyState.
 * - `emptyText`        teks EmptyState.
 * - `table`            node tabel yang ditampilkan saat mode tabel.
 * - `summary`          node opsional di atas grafik (mis. StatCard mean/median).
 * - `children`         grafik.
 */
export default function ChartCard({
    title,
    description,
    unavailableLabel,
    isEmpty = false,
    emptyText = 'Belum ada jawaban yang masuk untuk filter ini.',
    table,
    summary,
    children,
    className,
}) {
    const [isTableView, setIsTableView] = useState(false);
    const isUnavailable = Boolean(unavailableLabel);
    const canToggle = !isUnavailable && !isEmpty && Boolean(table);

    return (
        <Card className={cn('min-w-0', className)}>
            <CardHeader>
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                        <CardTitle>{title}</CardTitle>
                        {description && <CardDescription>{description}</CardDescription>}
                    </div>
                    {canToggle && (
                        <Button
                            variant="ghost"
                            size="sm"
                            aria-pressed={isTableView}
                            onClick={() => setIsTableView((current) => !current)}
                            className="shrink-0"
                        >
                            {isTableView ? <ChartColumn aria-hidden="true" /> : <Table2 aria-hidden="true" />}
                            {isTableView ? 'Lihat grafik' : 'Lihat tabel'}
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {isUnavailable ? (
                    <EmptyState
                        icon={Info}
                        title="Metrik belum tersedia"
                        description={`Kuesioner ini belum punya pertanyaan dengan kunci ${unavailableLabel}.`}
                        className="py-6"
                    />
                ) : isEmpty ? (
                    <EmptyState icon={ChartColumn} title="Belum ada data" description={emptyText} className="py-6" />
                ) : (
                    <>
                        {summary}
                        {isTableView ? table : children}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
