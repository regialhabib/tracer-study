import { Link, router, usePage } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Input, buttonVariants } from '@/Components/ui';
import useInboxChannel from '@/lib/pesan/useInboxChannel';
import { cn } from '@/lib/utils';
import ConversationList from './ConversationList';

/** Naikkan percakapan yang menerima pesan baru dan perbarui cuplikan serta jumlah belum dibaca. */
function applyIncoming(list, payload, activeId, query) {
    const { conversation_id: conversationId, message, sender } = payload;
    const lastMessage = { body: message.body, sender_id: message.sender_id, created_at: message.created_at };
    const existing = list.find((item) => item.id === conversationId);

    if (!existing) {
        if (query) {
            return list;
        }

        return [
            {
                id: conversationId,
                other: sender,
                last_message: lastMessage,
                unread_count: conversationId === activeId ? 0 : 1,
                last_message_at: message.created_at,
            },
            ...list,
        ];
    }

    const updated = {
        ...existing,
        last_message: lastMessage,
        last_message_at: message.created_at,
        unread_count: conversationId === activeId ? 0 : (existing.unread_count ?? 0) + 1,
    };

    return [updated, ...list.filter((item) => item.id !== conversationId)];
}

/**
 * InboxPanel — panel kiri: tombol Pesan baru, pencarian nama, daftar percakapan.
 * Memegang salinan lokal daftar agar bisa diperbarui realtime.
 */
export default function InboxPanel({ conversations, filters, activeId = null }) {
    const currentUserId = usePage().props.auth?.user?.id;
    const [items, setItems] = useState(conversations);
    const [query, setQuery] = useState(filters?.q ?? '');
    const isFirstRender = useRef(true);
    const queryRef = useRef(query);

    useEffect(() => {
        setItems(conversations);
    }, [conversations]);

    useEffect(() => {
        queryRef.current = query;

        if (isFirstRender.current) {
            isFirstRender.current = false;

            return undefined;
        }

        const timer = setTimeout(() => {
            const target = activeId ? route('pesan.show', activeId) : route('pesan.index');

            router.get(target, query ? { q: query } : {}, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['conversations', 'filters'],
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    useInboxChannel(currentUserId, (payload) => {
        setItems((current) => applyIncoming(current, payload, activeId, queryRef.current));
    });

    return (
        <>
            <div className="flex shrink-0 flex-col gap-3 border-b border-border p-4">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="text-base font-bold tracking-tight text-foreground">Pesan</h2>
                    <Link
                        href={route('pesan.cari')}
                        className={cn(buttonVariants({ size: 'sm' }), 'min-h-11 md:min-h-9')}
                    >
                        <Plus aria-hidden="true" />
                        Pesan baru
                    </Link>
                </div>
                <div className="relative">
                    <Search
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Cari nama percakapan"
                        aria-label="Cari percakapan berdasarkan nama"
                        className="pl-9"
                    />
                </div>
            </div>
            <ConversationList
                conversations={items}
                activeId={activeId}
                currentUserId={currentUserId}
                isSearching={query.trim() !== ''}
            />
        </>
    );
}
