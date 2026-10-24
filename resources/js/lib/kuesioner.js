/**
 * Helper kuesioner bersama (builder admin, pratinjau, pengisian alumni).
 * Aturan visibilitas HARUS sama dengan app/Services/Kuesioner/VisibilityResolver.php.
 */

export const QUESTION_TYPE_LABELS = {
    text: 'Teks singkat',
    textarea: 'Paragraf',
    radio: 'Pilihan tunggal',
    checkbox: 'Pilihan ganda',
    select: 'Dropdown',
    rating: 'Skala 1–5',
    number: 'Angka',
    date: 'Tanggal',
};

export const OPTION_TYPES = ['radio', 'checkbox', 'select'];

export const KUESIONER_STATUS_LABELS = { draft: 'Draf', active: 'Aktif', closed: 'Ditutup' };

export const KUESIONER_STATUS_BADGE_VARIANTS = { draft: 'neutral', active: 'success', closed: 'warning' };

export const RESPON_STATUS_LABELS = { draft: 'Draf', submitted: 'Terkirim' };

export const METRIC_KEY_LABELS = {
    status_kegiatan: 'Status kegiatan',
    masa_tunggu_bulan: 'Masa tunggu (bulan)',
    rentang_pendapatan: 'Rentang pendapatan',
    nama_lembaga: 'Nama kampus/tempat kerja',
    relevansi_ilmu: 'Relevansi ilmu',
    kebutuhan_keterampilan: 'Kebutuhan keterampilan',
};

export function hasOptions(type) {
    return OPTION_TYPES.includes(type);
}

export function isEmptyAnswer(value) {
    if (Array.isArray(value)) {
        return value.filter((item) => item !== null && item !== '').length === 0;
    }

    return value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
}

/**
 * Menentukan pertanyaan yang tampil.
 * @param {Array<{id:number, conditional_rule:?{depends_on:number, operator:'equals'|'in', value:string|string[]}}>} questions urut sesuai `order` (seluruh kuesioner, lintas bagian)
 * @param {Record<number, any>} answers nilai bertipe dikunci id pertanyaan
 * @returns {Record<number, boolean>}
 */
export function resolveVisibility(questions, answers) {
    const visibility = {};

    for (const question of questions) {
        visibility[question.id] = isVisible(question.conditional_rule, answers, visibility);
    }

    return visibility;
}

function isVisible(rule, answers, visibility) {
    if (!rule || rule.depends_on === undefined || rule.depends_on === null) {
        return true;
    }

    if (!visibility[rule.depends_on]) {
        return false;
    }

    const answer = answers[rule.depends_on];

    if (isEmptyAnswer(answer)) {
        return false;
    }

    const expected = [].concat(rule.value ?? []).map(String);
    const given = [].concat(answer).map(String);

    return (rule.operator ?? 'equals') === 'in'
        ? given.some((item) => expected.includes(item))
        : given.includes(expected[0]);
}

/** Label opsi untuk sebuah nilai (atau daftar nilai) — untuk ringkasan jawaban. */
export function formatAnswer(question, value) {
    if (isEmptyAnswer(value)) {
        return null;
    }

    if (hasOptions(question.question_type)) {
        const labelOf = (item) => question.options.find((option) => String(option.value) === String(item))?.label ?? String(item);

        return [].concat(value).map(labelOf).join(', ');
    }

    if (question.question_type === 'date') {
        return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`));
    }

    if (question.question_type === 'rating') {
        return `${value} dari 5`;
    }

    return String(value);
}
