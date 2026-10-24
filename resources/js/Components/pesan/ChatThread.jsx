import { LoaderCircle, MessageCircleDashed } from 'lucide-react';
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button } from '@/Components/ui';
import { dayKey, formatDayLabel } from '@/lib/pesan/format';
import usePercakapanChannel from '@/lib/pesan/usePercakapanChannel';
import { setPesanUnread } from '@/lib/pesan/usePesanUnread';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';

const NEAR_BOTTOM_PX = 120;
const LOAD_MORE_THRESHOLD_PX = 80;

function errorTextFrom(error) {
    const data = error?.response?.data;

    return data?.errors?.body?.[0] ?? data?.message ?? 'Pesan belum terkirim. Periksa koneksi Anda lalu coba lagi.';
}

/**
 * ChatThread — daftar pesan + input untuk satu percakapan.
 * Render dengan `key={conversation.id}` agar state ter-reset saat berpindah percakapan.
 */
export default function ChatThread({ conversationId, currentUserId, initialMessages, initialHasMore, canReply, replyBlockedReason }) {
    const [messages, setMessages] = useState(initialMessages);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [announcement, setAnnouncement] = useState('');

    const scrollRef = useRef(null);
    const isNearBottomRef = useRef(true);
    const preserveRef = useRef(null);
    const forceBottomRef = useRef(true);
    const isLoadingRef = useRef(false);

    const markAsRead = useCallback(() => {
        window.axios
            .post(route('pesan.read', conversationId))
            .then((response) => setPesanUnread(response.data?.unread_total))
            .catch(() => {});
    }, [conversationId]);

    useLayoutEffect(() => {
        const element = scrollRef.current;

        if (!element) {
            return;
        }

        if (preserveRef.current) {
            const { height, top } = preserveRef.current;
            element.scrollTop = element.scrollHeight - height + top;
            preserveRef.current = null;

            return;
        }

        if (forceBottomRef.current || isNearBottomRef.current) {
            element.scrollTop = element.scrollHeight;
            forceBottomRef.current = false;
        }
    }, [messages]);

    const appendMessage = useCallback((incoming) => {
        setMessages((current) => (current.some((item) => item.id === incoming.id) ? current : [...current, incoming]));
    }, []);

    usePercakapanChannel(conversationId, {
        onTerkirim: (payload) => {
            const incoming = payload?.message;

            if (!incoming) {
                return;
            }

            appendMessage(incoming);

            if (incoming.sender_id !== currentUserId) {
                setAnnouncement('Pesan baru diterima');
                markAsRead();
            }
        },
        onDibaca: (payload) => {
            if (payload?.reader_id === currentUserId) {
                return;
            }

            setMessages((current) =>
                current.map((item) =>
                    item.sender_id === currentUserId && !item.is_read
                        ? { ...item, is_read: true, read_at: payload?.read_at ?? item.read_at }
                        : item,
                ),
            );
        },
    });

    const loadOlder = useCallback(() => {
        const oldest = messages.find((item) => typeof item.id === 'number');

        if (isLoadingRef.current || !hasMore || !oldest) {
            return;
        }

        isLoadingRef.current = true;
        setIsLoadingMore(true);
        setLoadError(false);

        window.axios
            .get(route('pesan.history', conversationId), { params: { before: oldest.id } })
            .then((response) => {
                const element = scrollRef.current;

                if (element) {
                    preserveRef.current = { height: element.scrollHeight, top: element.scrollTop };
                }

                setMessages((current) => {
                    const known = new Set(current.map((item) => item.id));

                    return [...response.data.data.filter((item) => !known.has(item.id)), ...current];
                });
                setHasMore(Boolean(response.data.has_more));
            })
            .catch(() => setLoadError(true))
            .finally(() => {
                isLoadingRef.current = false;
                setIsLoadingMore(false);
            });
    }, [messages, hasMore, conversationId]);

    const handleScroll = () => {
        const element = scrollRef.current;

        if (!element) {
            return;
        }

        isNearBottomRef.current = element.scrollHeight - element.scrollTop - element.clientHeight < NEAR_BOTTOM_PX;

        if (element.scrollTop < LOAD_MORE_THRESHOLD_PX && hasMore && !loadError) {
            loadOlder();
        }
    };

    const deliver = useCallback(
        (tempId, body) => {
            window.axios
                .post(route('pesan.store', conversationId), { body })
                .then((response) => {
                    const saved = response.data.message;

                    setMessages((current) => {
                        const withoutTemp = current.filter((item) => item.id !== tempId);

                        return withoutTemp.some((item) => item.id === saved.id) ? withoutTemp : [...withoutTemp, saved];
                    });
                })
                .catch((error) => {
                    setMessages((current) =>
                        current.map((item) =>
                            item.id === tempId ? { ...item, status: 'failed', error: errorTextFrom(error) } : item,
                        ),
                    );
                });
        },
        [conversationId],
    );

    const send = (body) => {
        const tempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        forceBottomRef.current = true;
        setMessages((current) => [
            ...current,
            {
                id: tempId,
                conversation_id: conversationId,
                sender_id: currentUserId,
                body,
                is_read: false,
                read_at: null,
                created_at: new Date().toISOString(),
                status: 'sending',
            },
        ]);
        deliver(tempId, body);
    };

    const retry = (message) => {
        setMessages((current) =>
            current.map((item) => (item.id === message.id ? { ...item, status: 'sending', error: undefined } : item)),
        );
        deliver(message.id, message.body);
    };

    const discard = (message) => {
        setMessages((current) => current.filter((item) => item.id !== message.id));
    };

    useEffect(() => {
        const hasUnreadFromOther = initialMessages.some((item) => item.sender_id !== currentUserId && !item.is_read);

        if (hasUnreadFromOther) {
            markAsRead();
        }
        // Hanya saat percakapan dibuka.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    let previousDay = null;

    return (
        <>
            <div ref={scrollRef} onScroll={handleScroll} className="min-h-0 flex-1 overflow-y-auto bg-background px-3 py-4 sm:px-4">
                {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <MessageCircleDashed aria-hidden="true" className="size-6" />
                        </div>
                        <h3 className="text-base font-semibold text-foreground">Belum ada pesan</h3>
                        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                            {canReply ? 'Sapa lebih dulu dengan menulis pesan di bawah.' : 'Percakapan ini belum memiliki pesan.'}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {(hasMore || isLoadingMore) && (
                            <div className="flex justify-center pb-2">
                                {isLoadingMore ? (
                                    <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                                        <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
                                        Memuat pesan sebelumnya
                                    </span>
                                ) : (
                                    <Button variant="ghost" size="sm" onClick={loadOlder}>
                                        {loadError ? 'Gagal memuat. Coba lagi' : 'Muat pesan sebelumnya'}
                                    </Button>
                                )}
                            </div>
                        )}
                        {messages.map((message) => {
                            const currentDay = dayKey(message.created_at);
                            const showDay = currentDay !== previousDay;
                            previousDay = currentDay;

                            return (
                                <Fragment key={message.id}>
                                    {showDay && (
                                        <div className="my-2 flex justify-center">
                                            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                                {formatDayLabel(message.created_at)}
                                            </span>
                                        </div>
                                    )}
                                    <ChatBubble
                                        message={message}
                                        isOwn={message.sender_id === currentUserId}
                                        onRetry={retry}
                                        onDiscard={discard}
                                    />
                                </Fragment>
                            );
                        })}
                    </div>
                )}
            </div>

            <div aria-live="polite" className="sr-only">
                {announcement}
            </div>

            {canReply ? (
                <ChatInput onSend={send} />
            ) : (
                <p
                    role="status"
                    className="shrink-0 border-t border-border bg-muted px-4 py-3 text-center text-sm text-muted-foreground"
                >
                    {replyBlockedReason ?? 'Anda tidak dapat membalas percakapan ini.'}
                </p>
            )}
        </>
    );
}
