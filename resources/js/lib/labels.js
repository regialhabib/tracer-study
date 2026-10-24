/**
 * Label Bahasa Indonesia untuk nilai enum dari server.
 *
 * Sumber kebenaran di backend: `App\Enums\AlumniStatus`, `App\Enums\AccountStatus`,
 * dan kolom `alumni_profiles.gender` (L/P). Jaga agar tetap sinkron.
 */

/** Status kegiatan alumni (`alumni_profiles.current_status`). Urutan mengikuti DESIGN.md §2.3. */
export const ALUMNI_STATUS_LABELS = {
    pengabdian: 'Pengabdian/Khidmah',
    kuliah_islam: 'Kuliah Keislaman',
    kuliah_umum: 'Kuliah Umum',
    bekerja: 'Bekerja',
    wirausaha: 'Wirausaha',
    mencari_kerja: 'Mencari Kerja',
    lainnya: 'Lainnya',
};

/** Status akun pengguna (`users.status`). */
export const ACCOUNT_STATUS_LABELS = {
    active: 'Aktif',
    pending: 'Menunggu Verifikasi',
    inactive: 'Nonaktif',
};

/** Varian `<Badge>` per status akun (DESIGN.md §2.2: status selalu ikon + teks + warna). */
export const ACCOUNT_STATUS_BADGE_VARIANTS = {
    active: 'success',
    pending: 'warning',
    inactive: 'neutral',
};

/** Jenis kelamin (`alumni_profiles.gender`). */
export const GENDER_LABELS = {
    L: 'Laki-laki',
    P: 'Perempuan',
};

/**
 * Ambil label dari peta di atas; kembalikan `fallback` bila nilai kosong/tidak dikenal.
 *
 * @example labelFor(ALUMNI_STATUS_LABELS, 'bekerja') // "Bekerja"
 */
export function labelFor(labels, value, fallback = '-') {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }

    return labels[value] ?? fallback;
}

/**
 * Ubah peta label menjadi daftar opsi untuk `<Select>`/filter.
 *
 * @example toOptions(GENDER_LABELS) // [{ value: 'L', label: 'Laki-laki' }, { value: 'P', label: 'Perempuan' }]
 */
export function toOptions(labels) {
    return Object.entries(labels).map(([value, label]) => ({ value, label }));
}
