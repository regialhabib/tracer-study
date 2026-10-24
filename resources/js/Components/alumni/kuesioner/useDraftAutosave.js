import { useCallback, useEffect, useRef, useState } from 'react';

/** Akses localStorage yang aman: bisa melempar galat (mode privat, data situs diblokir). */
export function readLocalDraft(key) {
    try {
        const raw = window.localStorage.getItem(key);

        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function writeLocalDraft(key, draft) {
    try {
        window.localStorage.setItem(key, JSON.stringify(draft));
    } catch {
        // Penyimpanan lokal tidak tersedia; draf tetap ada di memori halaman.
    }
}

function removeLocalDraft(key) {
    try {
        window.localStorage.removeItem(key);
    } catch {
        // Abaikan.
    }
}

export function draftStorageKey(kuesionerId, userId) {
    return `kuesioner:${kuesionerId}:${userId}`;
}

/**
 * Simpan draf ke server lewat axios. Gagal jaringan/server → disimpan di localStorage
 * dan dikirim ulang saat peramban kembali online.
 *
 * `save({ section, answers, validate })` mengembalikan
 * `{ ok: true }` | `{ ok: false, errors }` (422) | `{ ok: false, offline: true }`.
 */
export function useDraftAutosave({ kuesionerId, userId, serverUpdatedAt }) {
    const storageKey = draftStorageKey(kuesionerId, userId);
    const [status, setStatus] = useState(() => (typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'idle'));
    const [savedAt, setSavedAt] = useState(serverUpdatedAt ?? null);
    const inFlight = useRef(0);

    const save = useCallback(
        async (input) => {
            const pending = readLocalDraft(storageKey);
            const payload = pending ? { ...input, answers: { ...pending.answers, ...input.answers } } : input;

            inFlight.current += 1;
            setStatus('saving');

            try {
                const { data } = await window.axios.put(route('alumni.kuesioner.draft', kuesionerId), payload);

                removeLocalDraft(storageKey);

                setSavedAt(data.saved_at);
                setStatus('saved');

                return { ok: true };
            } catch (error) {
                const httpStatus = error.response?.status;

                if (httpStatus === 422) {
                    setStatus('error');

                    return { ok: false, errors: error.response.data?.errors ?? {} };
                }

                if (httpStatus === 403) {
                    setStatus('error');

                    return { ok: false, forbidden: true, message: error.response.data?.message };
                }

                writeLocalDraft(storageKey, {
                    section: payload.section,
                    answers: payload.answers,
                    savedAt: Date.now(),
                });
                setStatus(error.response ? 'error' : 'offline');

                return { ok: false, offline: true };
            } finally {
                inFlight.current -= 1;
            }
        },
        [kuesionerId, storageKey],
    );

    const flushLocal = useCallback(() => {
        const local = readLocalDraft(storageKey);

        if (!local || inFlight.current > 0) {
            return Promise.resolve();
        }

        return save({ section: local.section, answers: local.answers, validate: false });
    }, [save, storageKey]);

    useEffect(() => {
        const handleOnline = () => {
            flushLocal();
        };
        const handleOffline = () => setStatus('offline');

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [flushLocal]);

    return { status, savedAt, save, flushLocal, storageKey };
}
