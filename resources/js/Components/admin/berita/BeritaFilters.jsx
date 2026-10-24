import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { Button, Input, Label, Select } from '@/Components/ui';

const EMPTY_FILTERS = { q: '', tipe: '', status: '' };

const STATUS_OPTIONS = [
    { value: 'draf', label: 'Draf' },
    { value: 'terjadwal', label: 'Terjadwal' },
    { value: 'terbit', label: 'Terbit' },
];

function compact(values) {
    return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== '' && value !== null));
}

/**
 * Pencarian judul (debounce) serta filter tipe dan status daftar berita.
 */
export default function BeritaFilters({ filters, options }) {
    const [values, setValues] = useState({ ...EMPTY_FILTERS, ...filters });
    const isFirstRender = useRef(true);

    const visit = (next) => {
        router.get(route('admin.berita.index'), compact(next), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return undefined;
        }

        const timer = setTimeout(() => visit(values), 350);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values.q]);

    const update = (key, value) => {
        const next = { ...values, [key]: value };
        setValues(next);

        if (key !== 'q') {
            visit(next);
        }
    };

    const reset = () => {
        setValues(EMPTY_FILTERS);
        visit(EMPTY_FILTERS);
    };

    const hasActiveFilters = Object.keys(compact(values)).length > 0;

    return (
        <div className="space-y-3">
            <div className="relative">
                <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                    type="search"
                    value={values.q}
                    onChange={(event) => update('q', event.target.value)}
                    placeholder="Cari judul"
                    aria-label="Cari judul"
                    className="pl-9"
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label htmlFor="filter-tipe">Tipe</Label>
                    <Select
                        id="filter-tipe"
                        value={values.tipe}
                        onChange={(event) => update('tipe', event.target.value)}
                        placeholder="Semua"
                    >
                        {options.types.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="filter-status">Status</Label>
                    <Select
                        id="filter-status"
                        value={values.status}
                        onChange={(event) => update('status', event.target.value)}
                        placeholder="Semua"
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </Select>
                </div>
            </div>

            {hasActiveFilters && (
                <Button type="button" variant="ghost" size="sm" onClick={reset}>
                    <X aria-hidden="true" />
                    Atur Ulang Filter
                </Button>
            )}
        </div>
    );
}
