import { useEffect, useRef } from 'react';

/**
 * Mendengarkan `pesan.masuk` pada channel pribadi pengguna. Aman bila `window.Echo` null.
 * `onMasuk(payload)` selalu memakai versi terbaru tanpa perlu berlangganan ulang.
 */
export default function useInboxChannel(userId, onMasuk) {
    const callbackRef = useRef(onMasuk);

    useEffect(() => {
        callbackRef.current = onMasuk;
    });

    useEffect(() => {
        if (!window.Echo || !userId) {
            return undefined;
        }

        const handler = (payload) => callbackRef.current?.(payload);
        const channel = window.Echo.private(`App.Models.User.${userId}`);

        channel.listen('.pesan.masuk', handler);

        return () => channel.stopListening('.pesan.masuk', handler);
    }, [userId]);
}
