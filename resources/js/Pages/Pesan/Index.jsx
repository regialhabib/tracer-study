import { MessagesSquare } from 'lucide-react';
import { EmptyState } from '@/Components/ui';
import InboxPanel from '@/Components/pesan/InboxPanel';
import PesanLayout from '@/Components/pesan/PesanLayout';
import PesanShell from '@/Components/pesan/PesanShell';

export default function Index({ conversations, filters }) {
    return (
        <PesanLayout title="Pesan">
            <PesanShell list={<InboxPanel conversations={conversations} filters={filters} />} active="list">
                <div className="flex flex-1 items-center justify-center">
                    <EmptyState
                        icon={MessagesSquare}
                        title="Pilih percakapan"
                        description="Pilih percakapan di sebelah kiri, atau mulai percakapan baru dengan tombol Pesan baru."
                    />
                </div>
            </PesanShell>
        </PesanLayout>
    );
}
