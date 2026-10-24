/**
 * Tindakan perubahan status kuesioner (selaras dengan KuesionerStatus::allowedTransitions()).
 * Kunci = status tujuan.
 */
export const STATUS_ACTIONS = {
    active: {
        label: 'Aktifkan Kuesioner',
        title: 'Aktifkan kuesioner ini?',
        description:
            'Alumni pada angkatan target dapat mulai mengisi selama periode berlangsung. Hanya satu kuesioner aktif yang boleh menargetkan angkatan yang sama.',
    },
    closed: {
        label: 'Tutup Kuesioner',
        title: 'Tutup kuesioner ini?',
        description: 'Alumni tidak dapat lagi mengisi atau merevisi jawaban. Anda masih dapat mengaktifkannya kembali nanti.',
    },
};

export const dateFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

export function formatDate(value) {
    return value ? dateFormatter.format(new Date(`${value}T00:00:00`)) : '-';
}

export function formatTargets(years) {
    return years && years.length > 0 ? years.join(', ') : 'Semua angkatan';
}

/** Tindakan status yang tersedia dari status saat ini. */
export function nextStatusTargets(status) {
    return { draft: ['active'], active: ['closed'], closed: ['active'] }[status] ?? [];
}
