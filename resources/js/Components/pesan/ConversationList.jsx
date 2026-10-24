import { Link } from '@inertiajs/react';
import { MessagesSquare } from 'lucide-react';
import { Badge, EmptyState } from '@/Components/ui';
import { formatListTime } from '@/lib/pesan/format';
import { cn } from '@/lib/utils';
import ParticipantAvatar from './ParticipantAvatar';

function ConversationItem({ conversation, isActive, currentUserId }) {
    const { other, last_message: lastMessage, unread_count: unreadCount } = conversation;
    const hasUnread = unreadCount > 0;
    const preview = lastMessage
        ? `${lastMessage.sender_id === currentUserId ? 'Anda: ' : ''}${lastMessage.body}`
        : 'Belum ada pesan';

    return (
        <Link
            href={route('pesan.show', conversation.id)}
            preserveScroll
            aria-current={isActive ? 'page' : undefined}
            className={cn(
                'flex min-h-[72px] items-center gap-3 border-b border-border px-4 py-3 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                isActive ? 'bg-primary-soft' : 'hover:bg-muted',
            )}
        >
            <ParticipantAvatar participant={other} />
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                    <p className="flex min-w-0 items-center gap-2">
                        <span className={cn('truncate text-sm text-foreground', hasUnread ? 'font-bold' : 'font-semibold')}>
                            {other.name}
                        </span>
                        {other.is_admin && (
                            <Badge variant="info" className="shrink-0">
                                Admin
                            </Badge>
                        )}
                    </p>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {formatListTime(conversation.last_message_at)}
                    </span>
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p className={cn('truncate text-sm', hasUnread ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                        {preview}
                    </p>
                    {hasUnread && (
                        <span className="min-w-5 shrink-0 rounded-full bg-primary px-1.5 text-center text-xs font-semibold leading-5 tabular-nums text-primary-foreground">
                            {unreadCount > 99 ? '99+' : unreadCount}
                            <span className="sr-only"> pesan belum dibaca</span>
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

/** Daftar percakapan; `activeId` menandai percakapan yang sedang dibuka. */
export default function ConversationList({ conversations, activeId = null, currentUserId, isSearching = false }) {
    if (conversations.length === 0) {
        return (
            <EmptyState
                icon={MessagesSquare}
                title={isSearching ? 'Percakapan tidak ditemukan' : 'Belum ada percakapan'}
                description={
                    isSearching
                        ? 'Coba nama lain, atau mulai percakapan baru lewat tombol Pesan baru.'
                        : 'Mulai percakapan baru dengan sesama alumni atau pengurus.'
                }
            />
        );
    }

    return (
        <ul className="min-h-0 flex-1 overflow-y-auto">
            {conversations.map((conversation) => (
                <li key={conversation.id}>
                    <ConversationItem
                        conversation={conversation}
                        isActive={conversation.id === activeId}
                        currentUserId={currentUserId}
                    />
                </li>
            ))}
        </ul>
    );
}
