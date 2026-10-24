const timeFormatter = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
const weekdayFormatter = new Intl.DateTimeFormat('id-ID', { weekday: 'long' });
const shortDateFormatter = new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' });
const longDateFormatter = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dayDifference(date) {
    return Math.round((startOfDay(new Date()) - startOfDay(date)) / DAY_MS);
}

/** Kunci hari lokal (YYYY-MM-DD) untuk mengelompokkan pesan per hari. */
export function dayKey(iso) {
    const date = new Date(iso);

    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

/** Jam pesan, mis. "14.05". */
export function formatTime(iso) {
    return timeFormatter.format(new Date(iso));
}

/** Waktu singkat untuk daftar percakapan: jam / Kemarin / nama hari / tanggal. */
export function formatListTime(iso) {
    if (!iso) {
        return '';
    }

    const date = new Date(iso);
    const difference = dayDifference(date);

    if (difference <= 0) {
        return formatTime(iso);
    }

    if (difference === 1) {
        return 'Kemarin';
    }

    if (difference < 7) {
        return weekdayFormatter.format(date);
    }

    return shortDateFormatter.format(date);
}

/** Label pemisah tanggal: Hari ini / Kemarin / tanggal lengkap. */
export function formatDayLabel(iso) {
    const date = new Date(iso);
    const difference = dayDifference(date);

    if (difference <= 0) {
        return 'Hari ini';
    }

    if (difference === 1) {
        return 'Kemarin';
    }

    return longDateFormatter.format(date);
}
