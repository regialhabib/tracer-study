/**
 * Helper navigasi layout.
 *
 * `resolveNavItem({ label, icon, routeName, activePattern })` mengembalikan item siap render:
 * - `isAvailable` false bila route belum terdaftar (fitur belum dibuat) → tampil nonaktif "Segera hadir".
 *   Begitu route-nya ditambahkan, item otomatis aktif tanpa perlu mengubah layout.
 * - `href` URL route (null bila belum tersedia).
 * - `isActive` true bila route saat ini cocok dengan `activePattern` (default `routeName`), mis. 'admin.alumni.*'.
 */
export function resolveNavItem({ routeName, activePattern, ...item }) {
    const isAvailable = route().has(routeName);

    return {
        ...item,
        key: routeName,
        isAvailable,
        href: isAvailable ? route(routeName) : null,
        isActive: isAvailable && Boolean(route().current(activePattern ?? routeName)),
    };
}

/** Teks bantuan untuk item navigasi yang fiturnya belum tersedia. */
export const COMING_SOON_LABEL = 'Segera hadir';

/** Inisial maksimal dua huruf dari nama pengguna, untuk avatar. */
export function initialsFromName(name) {
    if (!name) {
        return 'A';
    }

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join('');
}
