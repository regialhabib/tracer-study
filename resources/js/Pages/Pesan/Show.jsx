import { usePage } from '@inertiajs/react';
import ChatHeader from '@/Components/pesan/ChatHeader';
import ChatThread from '@/Components/pesan/ChatThread';
import InboxPanel from '@/Components/pesan/InboxPanel';
import PesanLayout from '@/Components/pesan/PesanLayout';
import PesanShell from '@/Components/pesan/PesanShell';

export default function Show({
    conversations,
    filters,
    conversation,
    other,
    messages,
    canReply,
    replyBlockedReason,
    isBlockedByMe,
    canBlock,
}) {
    const currentUserId = usePage().props.auth?.user?.id;

    return (
        <PesanLayout title={`Pesan dengan ${other.name}`}>
            <PesanShell
                active="chat"
                list={<InboxPanel conversations={conversations} filters={filters} activeId={conversation.id} />}
            >
                <ChatHeader other={other} canBlock={canBlock} isBlockedByMe={isBlockedByMe} />
                <ChatThread
                    key={conversation.id}
                    conversationId={conversation.id}
                    currentUserId={currentUserId}
                    initialMessages={messages.data}
                    initialHasMore={messages.has_more}
                    canReply={canReply}
                    replyBlockedReason={replyBlockedReason}
                />
            </PesanShell>
        </PesanLayout>
    );
}
