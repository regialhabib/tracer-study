import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { chartColor, formatNumber, truncate } from '@/lib/analitik';

const AXIS_TICK = { fill: 'hsl(var(--muted-foreground))', fontSize: 12 };

function ChartTooltip({ active, payload, seriesName }) {
    if (!active || !payload?.length) {
        return null;
    }

    const datum = payload[0].payload;

    return (
        <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-sm">
            <p className="font-semibold text-foreground">{datum.label}</p>
            <p className="tabular-nums text-muted-foreground">
                {seriesName}: <span className="font-semibold text-foreground">{datum.tooltip ?? formatNumber(datum.value)}</span>
            </p>
        </div>
    );
}

/**
 * Grafik batang satu seri (tanpa legenda; judul kartu menamai seri).
 *
 * Props:
 * - `data`       [{ label, value, valueLabel?, tooltip?, color? }] — `valueLabel` = label nilai langsung.
 * - `layout`     'horizontal' (batang tegak) | 'vertical' (batang mendatar; untuk label panjang).
 * - `color`      warna default batang (token chart-1 = primary).
 * - `ariaLabel`  deskripsi grafik untuk pembaca layar.
 * - `seriesName` nama nilai pada tooltip.
 * - `domain`     domain sumbu nilai, mis. [0, 100].
 */
export default function BarChartView({
    data,
    layout = 'horizontal',
    color = chartColor(1),
    ariaLabel,
    seriesName = 'Jumlah',
    domain,
}) {
    const isHorizontalBars = layout === 'vertical';
    const height = isHorizontalBars ? Math.max(180, data.length * 44 + 24) : 260;
    const rows = data.map((row) => ({ ...row, valueLabel: row.valueLabel ?? formatNumber(row.value) }));

    return (
        <div role="img" aria-label={ariaLabel} className="w-full" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={rows}
                    layout={layout}
                    margin={{ top: 20, right: isHorizontalBars ? 72 : 8, bottom: 0, left: 0 }}
                    barCategoryGap="28%"
                >
                    <CartesianGrid
                        stroke="hsl(var(--border))"
                        strokeDasharray="3 3"
                        horizontal={!isHorizontalBars}
                        vertical={isHorizontalBars}
                    />
                    {isHorizontalBars ? (
                        <>
                            <XAxis type="number" hide domain={domain ?? [0, 'dataMax']} />
                            <YAxis
                                type="category"
                                dataKey="label"
                                width={112}
                                tick={AXIS_TICK}
                                tickFormatter={(value) => truncate(value, 16)}
                                axisLine={false}
                                tickLine={false}
                                interval={0}
                            />
                        </>
                    ) : (
                        <>
                            <XAxis
                                dataKey="label"
                                tick={AXIS_TICK}
                                tickFormatter={(value) => truncate(value, 10)}
                                axisLine={{ stroke: 'hsl(var(--border))' }}
                                tickLine={false}
                                interval={0}
                            />
                            <YAxis
                                tick={AXIS_TICK}
                                width={36}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                                domain={domain ?? [0, 'auto']}
                                tickFormatter={(value) => formatNumber(value)}
                            />
                        </>
                    )}
                    <Tooltip
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.6 }}
                        content={<ChartTooltip seriesName={seriesName} />}
                    />
                    <Bar
                        dataKey="value"
                        radius={isHorizontalBars ? [0, 4, 4, 0] : [4, 4, 0, 0]}
                        maxBarSize={28}
                        isAnimationActive={false}
                    >
                        {rows.map((row, index) => (
                            <Cell key={`${row.label}-${index}`} fill={row.color ?? color} />
                        ))}
                        <LabelList
                            dataKey="valueLabel"
                            position={isHorizontalBars ? 'right' : 'top'}
                            fill="hsl(var(--foreground))"
                            fontSize={12}
                            fontWeight={600}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
