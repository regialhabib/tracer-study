import { CalendarDays, GraduationCap, Megaphone, Newspaper } from 'lucide-react';

/**
 * Metadata tampilan per tipe kabar (DESIGN.md §2.2):
 * berita = netral, agenda = info, pengumuman = peringatan, info_beasiswa = sukses.
 */
const BERITA_TYPES = {
    berita: { label: 'Berita', variant: 'neutral', icon: Newspaper },
    agenda: { label: 'Agenda', variant: 'info', icon: CalendarDays },
    pengumuman: { label: 'Pengumuman', variant: 'warning', icon: Megaphone },
    info_beasiswa: { label: 'Info Beasiswa', variant: 'success', icon: GraduationCap },
};

export function getBeritaTypeMeta(type) {
    return BERITA_TYPES[type] ?? BERITA_TYPES.berita;
}

const shortDateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
});

const longDateFormatter = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
});

function toValidDate(value) {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
}

/** Format tanggal ringkas, mis. "23 Okt 2026". Mengembalikan null bila tanggal kosong/tidak valid. */
export function formatShortDate(value) {
    const date = toValidDate(value);

    return date ? shortDateFormatter.format(date) : null;
}

/** Format tanggal lengkap, mis. "Jumat, 23 Oktober 2026". */
export function formatLongDate(value) {
    const date = toValidDate(value);

    return date ? longDateFormatter.format(date) : null;
}

/** Format jam, mis. "08.00". */
export function formatTime(value) {
    const date = toValidDate(value);

    return date ? timeFormatter.format(date) : null;
}
