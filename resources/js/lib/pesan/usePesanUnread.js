import { usePage } from '@inertiajs/react';
import { useEffect, useSyncExternalStore } from 'react';

let unreadTotal = null;
const listeners = new Set();

/** Perbarui total pesan belum dibaca (dari event realtime atau respons server). */
export function setPesanUnread(value) {
    if (typeof value !== 'number' || value === unreadTotal) {
        return;
    }

    unreadTotal = value;
    listeners.forEach((listener) => listener());
}

function subscribe(listener) {
    listeners.add(listener);

    return () => listeners.delete(listener);
}

/**
 * Total pesan belum dibaca untuk badge navigasi. Nilai awal dari shared prop `pesan.unread`,
 * lalu diperbarui realtime lewat channel pribadi pengguna (bila Echo tersedia).
 * Mengembalikan `null` bila modul pesan tidak aktif untuk pengguna ini.
 */
export default function usePesanUnread() {
    const { auth, pesan } = usePage().props;
    const userId = auth?.user?.id;
    const propUnread = pesan?.unread;

    useEffect(() => {
        if (typeof propUnread === 'number') {
            setPesanUnread(propUnread);
        }
    }, [propUnread]);

    useEffect(() => {
        if (!window.Echo || !userId) {
            return undefined;
        }

        const handler = (payload) => setPesanUnread(payload?.unread_total);
        const channel = window.Echo.private(`App.Models.User.${userId}`);

        channel.listen('.pesan.masuk', handler);

        return () => channel.stopListening('.pesan.masuk', handler);
    }, [userId]);

    const value = useSyncExternalStore(subscribe, () => unreadTotal, () => null);

    if (pesan === null || pesan === undefined) {
        return null;
    }

    return value ?? propUnread ?? 0;
}
