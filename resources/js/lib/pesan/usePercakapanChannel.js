import { useEffect, useRef } from 'react';

/**
 * Mendengarkan `pesan.terkirim` dan `pesan.dibaca` pada channel `percakapan.{id}`.
 * Aman bila `window.Echo` null. Callback selalu versi terbaru; channel ditinggalkan saat unmount.
 */
export default function usePercakapanChannel(conversationId, { onTerkirim, onDibaca }) {
    const callbacksRef = useRef({ onTerkirim, onDibaca });

    useEffect(() => {
        callbacksRef.current = { onTerkirim, onDibaca };
    });

    useEffect(() => {
        if (!window.Echo || !conversationId) {
            return undefined;
        }

        const name = `percakapan.${conversationId}`;
        const channel = window.Echo.private(name);

        channel
            .listen('.pesan.terkirim', (payload) => callbacksRef.current.onTerkirim?.(payload))
            .listen('.pesan.dibaca', (payload) => callbacksRef.current.onDibaca?.(payload));

        return () => window.Echo.leave(name);
    }, [conversationId]);
}
