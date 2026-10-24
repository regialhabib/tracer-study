import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { Button, Checkbox, Input, Label, Select } from '@/Components/ui';
import { ACCOUNT_STATUS_LABELS, ALUMNI_STATUS_LABELS, GENDER_LABELS, toOptions } from '@/lib/labels';

const EMPTY_FILTERS = {
    q: '',
    angkatan: '',
    gender: '',
    major: '',
    status_kegiatan: '',
    status_akun: '',
    tampilkan_terhapus: false,
};

function compact(values) {
    return Object.fromEntries(
        Object.entries(values)
            .filter(([, value]) => value !== '' && value !== false && value !== null)
            .map(([key, value]) => [key, value === true ? 1 : value]),
    );
}

function SelectFilter({ id, label, value, onChange, options, className }) {
    return (
        <div className={`space-y-1.5 ${className ?? ''}`}>
            <Label htmlFor={id}>{label}</Label>
            <Select id={id} value={value} onChange={(event) => onChange(event.target.value)} placeholder="Semua">
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </Select>
        </div>
    );
}

/**
 * Baris filter daftar alumni. Pencarian memakai debounce; filter lain langsung diterapkan.
 */
export default function AlumniFilters({ filters, options }) {
    const [values, setValues] = useState({ ...EMPTY_FILTERS, ...filters });
    const isFirstRender = useRef(true);

    const visit = (next) => {
        router.get(route('admin.alumni.index'), compact(next), {
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
                    placeholder="Cari nama atau NISN"
                    aria-label="Cari nama atau NISN"
                    className="pl-9"
                />
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                <SelectFilter
                    id="filter-angkatan"
                    label="Angkatan"
                    value={values.angkatan}
                    onChange={(value) => update('angkatan', value)}
                    options={options.angkatan.map((year) => ({ value: year, label: String(year) }))}
                />
                <SelectFilter
                    id="filter-gender"
                    label="Jenis kelamin"
                    value={values.gender}
                    onChange={(value) => update('gender', value)}
                    options={toOptions(GENDER_LABELS)}
                />
                <SelectFilter
                    id="filter-major"
                    label="Peminatan"
                    value={values.major}
                    onChange={(value) => update('major', value)}
                    options={options.majors.map((major) => ({ value: major, label: major }))}
                />
                <SelectFilter
                    id="filter-status-kegiatan"
                    label="Status kegiatan"
                    value={values.status_kegiatan}
                    onChange={(value) => update('status_kegiatan', value)}
                    options={toOptions(ALUMNI_STATUS_LABELS)}
                />
                <SelectFilter
                    id="filter-status-akun"
                    label="Status akun"
                    value={values.status_akun}
                    onChange={(value) => update('status_akun', value)}
                    options={toOptions(ACCOUNT_STATUS_LABELS)}
                    className="col-span-2 lg:col-span-1"
                />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <Checkbox
                    label="Tampilkan yang sudah dihapus"
                    checked={Boolean(values.tampilkan_terhapus)}
                    onCheckedChange={(checked) => update('tampilkan_terhapus', checked)}
                />
                {hasActiveFilters && (
                    <Button type="button" variant="ghost" size="sm" onClick={reset}>
                        <X aria-hidden="true" />
                        Atur Ulang Filter
                    </Button>
                )}
            </div>
        </div>
    );
}
