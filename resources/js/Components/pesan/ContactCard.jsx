import { useState } from 'react';
import { router } from '@inertiajs/react';
import { MessageCircle, ShieldCheck } from 'lucide-react';
import { Badge, Button, Card } from '@/Components/ui';
import ParticipantAvatar from '@/Components/pesan/ParticipantAvatar';

/**
 * ContactCard — satu kontak di halaman Cari Kontak.
 * `contact` berbentuk KontakResource: { id, name, avatar_src, is_admin, angkatan, major }.
 */
export default function ContactCard({ contact }) {
    const [starting, setStarting] = useState(false);

    const detail = [contact.angkatan ? `Angkatan ${contact.angkatan}` : null, contact.major]
        .filter(Boolean)
        .join(' · ');

    const startConversation = () => {
        router.post(route('pesan.start', contact.id), {}, {
            onStart: () => setStarting(true),
            onFinish: () => setStarting(false),
        });
    };

    return (
        <Card className="flex items-center gap-3 p-4">
            <ParticipantAvatar participant={contact} className="size-12" />

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="truncate text-base font-semibold text-foreground">{contact.name}</p>
                    {contact.is_admin && (
                        <Badge variant="info" icon={ShieldCheck}>
                            Admin
                        </Badge>
                    )}
                </div>
                {detail !== '' && <p className="truncate text-sm text-muted-foreground">{detail}</p>}
            </div>

            <Button
                type="button"
                variant="outline"
                loading={starting}
                onClick={startConversation}
                aria-label={`Kirim pesan ke ${contact.name}`}
                className="shrink-0"
            >
                <MessageCircle aria-hidden="true" className="size-4" />
                <span className="hidden sm:inline">Kirim Pesan</span>
                <span className="sm:hidden">Pesan</span>
            </Button>
        </Card>
    );
}
