import { useState } from 'react';
import { router } from '@inertiajs/react';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { Button, Checkbox, Label, Select } from '@/Components/ui';
import { cleanFilters } from '@/lib/analitik';
import { GENDER_LABELS } from '@/lib/labels';

/**
 * Baris filter analitik: kuesioner, angkatan (multi), jenis kelamin, peminatan.
 * Setiap perubahan langsung memuat ulang halaman lewat `router.get`.
 *
 * Props:
 * - `routeName`     nama route tujuan (`admin.analitik.index` / `admin.analitik.pertanyaan`).
 * - `filters`       { kuesioner, angkatan, gender, major } dari server.
 * - `filterOptions` { kuesioner: [{id,title}], angkatan: [], majors: [] }.
 */
export default function FilterBar({ routeName, filters, filterOptions }) {
    const [isAngkatanOpen, setIsAngkatanOpen] = useState(false);
    const selectedAngkatan = (filters?.angkatan ?? []).map(Number);

    const apply = (changes) => {
        const next = cleanFilters({ ...filters, ...changes });

        router.get(route(routeName), next, { preserveState: true, preserveScroll: true, replace: true });
    };

    const toggleAngkatan = (year, checked) => {
        const next = checked ? [...selectedAngkatan, year] : selectedAngkatan.filter((value) => value !== year);

        apply({ angkatan: next.sort((a, b) => a - b) });
    };

    const hasActiveFilter = selectedAngkatan.length > 0 || Boolean(filters?.gender) || Boolean(filters?.major);

    return (
        <div className="rounded-lg border border-border bg-card p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="filter-kuesioner">Kuesioner</Label>
                    <Select
                        id="filter-kuesioner"
                        value={filters?.kuesioner ?? ''}
                        onChange={(event) => apply({ kuesioner: event.target.value })}
                    >
                        {(filterOptions?.kuesioner ?? []).map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.title}
                            </option>
                        ))}
                    </Select>
                </div>

                <div className="relative flex flex-col gap-1.5">
                    <Label htmlFor="filter-angkatan">Angkatan</Label>
                    <Button
                        id="filter-angkatan"
                        type="button"
                        variant="outline"
                        aria-expanded={isAngkatanOpen}
                        onClick={() => setIsAngkatanOpen((current) => !current)}
                        className="h-11 justify-between font-normal"
                    >
                        <span className="truncate tabular-nums">
                            {selectedAngkatan.length === 0 ? 'Semua angkatan' : selectedAngkatan.join(', ')}
                        </span>
                        <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                    </Button>
                    {isAngkatanOpen && (
                        <div className="absolute left-0 top-full z-20 mt-1 max-h-64 w-full min-w-48 overflow-y-auto rounded-md border border-border bg-card p-3 shadow-sm">
                            {(filterOptions?.angkatan ?? []).length === 0 ? (
                                <p className="text-sm text-muted-foreground">Belum ada angkatan.</p>
                            ) : (
                                <ul className="flex flex-col gap-3">
                                    {filterOptions.angkatan.map((year) => (
                                        <li key={year}>
                                            <Checkbox
                                                label={<span className="tabular-nums">{year}</span>}
                                                checked={selectedAngkatan.includes(Number(year))}
                                                onCheckedChange={(checked) => toggleAngkatan(Number(year), checked)}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="filter-gender">Jenis kelamin</Label>
                    <Select
                        id="filter-gender"
                        placeholder="Semua"
                        value={filters?.gender ?? ''}
                        onChange={(event) => apply({ gender: event.target.value })}
                    >
                        {Object.entries(GENDER_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="filter-major">Peminatan</Label>
                    <Select
                        id="filter-major"
                        placeholder="Semua peminatan"
                        value={filters?.major ?? ''}
                        onChange={(event) => apply({ major: event.target.value })}
                    >
                        {(filterOptions?.majors ?? []).map((major) => (
                            <option key={major} value={major}>
                                {major}
                            </option>
                        ))}
                    </Select>
                </div>
            </div>

            {hasActiveFilter && (
                <div className="mt-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setIsAngkatanOpen(false);
                            apply({ angkatan: [], gender: null, major: null });
                        }}
                    >
                        <RotateCcw aria-hidden="true" />
                        Atur ulang filter
                    </Button>
                </div>
            )}
        </div>
    );
}
