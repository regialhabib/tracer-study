/**
 * Helper analitik: pemetaan status kegiatan → token warna grafik (DESIGN.md §2.3)
 * dan pemformat angka/persen/tanggal berlokal id-ID.
 */

/** Pemetaan tetap status → nomor token `chart-N`. "Lainnya" selalu terakhir (abu-abu). */
export const STATUS_CHART_INDEX = {
    pengabdian: 1,
    kuliah_islam: 2,
    kuliah_umum: 3,
    bekerja: 4,
    wirausaha: 5,
    mencari_kerja: 6,
    lainnya: 7,
};

/** Kelas Tailwind (ditulis lengkap agar terdeteksi JIT) untuk penanda warna. */
export const STATUS_BG_CLASSES = {
    pengabdian: 'bg-chart-1',
    kuliah_islam: 'bg-chart-2',
    kuliah_umum: 'bg-chart-3',
    bekerja: 'bg-chart-4',
    wirausaha: 'bg-chart-5',
    mencari_kerja: 'bg-chart-6',
    lainnya: 'bg-chart-7',
};

/** Warna CSS untuk nomor token chart, mis. `hsl(var(--chart-1))`. */
export function chartColor(index = 1) {
    return `hsl(var(--chart-${index}))`;
}

/** Warna CSS untuk nilai status kegiatan; tak dikenal → "Lainnya". */
export function statusColor(value) {
    return chartColor(STATUS_CHART_INDEX[value] ?? 7);
}

export function statusBgClass(value) {
    return STATUS_BG_CLASSES[value] ?? STATUS_BG_CLASSES.lainnya;
}

const numberFormatter = new Intl.NumberFormat('id-ID');
const decimalFormatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });
const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
});

export function formatNumber(value) {
    return numberFormatter.format(Number(value) || 0);
}

/** Angka desimal maksimal 1 digit, mis. 4,5. `null` → "–". */
export function formatDecimal(value) {
    if (value === null || value === undefined) {
        return '–';
    }

    return decimalFormatter.format(Number(value) || 0);
}

/** `value` sudah dalam skala 0–100 (kontrak backend), mis. 62.5 → "62,5%". */
export function formatPercent(value) {
    return `${decimalFormatter.format(Number(value) || 0)}%`;
}

export function formatDate(value) {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : dateFormatter.format(date);
}

/** "12 · 30,5%" untuk label nilai langsung pada batang. */
export function countWithPercent(count, percent) {
    return `${formatNumber(count)} · ${formatPercent(percent)}`;
}

/** Hapus nilai kosong dari filter sebelum dijadikan query string. */
export function cleanFilters(filters) {
    const result = {};

    Object.entries(filters ?? {}).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            if (value.length > 0) {
                result[key] = value;
            }
        } else if (value !== null && value !== undefined && value !== '') {
            result[key] = value;
        }
    });

    return result;
}

/** Potong teks panjang untuk sumbu grafik. */
export function truncate(text, max = 18) {
    const value = String(text ?? '');

    return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}
