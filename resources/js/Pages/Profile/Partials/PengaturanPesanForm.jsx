import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Ban } from 'lucide-react';
import ParticipantAvatar from '@/Components/pesan/ParticipantAvatar';
import { Button, Card, CardContent, CardDescription, CardHeader, Checkbox } from '@/Components/ui';

export default function PengaturanPesanForm({ pesanSettings, blockedUsers = [], className = '' }) {
    const [saving, setSaving] = useState(false);
    const [unblockingId, setUnblockingId] = useState(null);

    const toggleAllow = (checked) => {
        router.patch(
            route('profile.pesan.update'),
            { allow_alumni_messages: checked },
            {
                preserveScroll: true,
                onStart: () => setSaving(true),
                onFinish: () => setSaving(false),
            },
        );
    };

    const unblock = (user) => {
        router.delete(route('pesan.blokir.destroy', user.id), {
            preserveScroll: true,
            onStart: () => setUnblockingId(user.id),
            onFinish: () => setUnblockingId(null),
        });
    };

    return (
        <section aria-labelledby="pesan-title" className={className}>
            <Card>
                <CardHeader>
                    <h2 id="pesan-title" className="text-lg font-semibold leading-snug tracking-tight text-foreground">
                        Pengaturan Pesan
                    </h2>
                    <CardDescription>Atur siapa yang dapat mengirim pesan kepada Anda.</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {pesanSettings && (
                        <Checkbox
                            label="Bisa dihubungi sesama alumni"
                            description="Bila dimatikan, alumni lain tidak dapat mencari atau mengirim pesan kepada Anda. Admin tetap dapat menghubungi Anda."
                            checked={Boolean(pesanSettings?.allow_alumni_messages)}
                            disabled={saving}
                            onCheckedChange={toggleAllow}
                        />
                    )}

                    <div>
                        <h3 className="text-base font-semibold text-foreground">Pengguna yang Diblokir</h3>

                        {blockedUsers.length === 0 ? (
                            <p className="mt-2 text-sm text-muted-foreground">Anda belum memblokir siapa pun.</p>
                        ) : (
                            <ul className="mt-3 divide-y divide-border rounded-md border border-border">
                                {blockedUsers.map((user) => (
                                    <li key={user.id} className="flex items-center gap-3 p-3">
                                        <ParticipantAvatar participant={user} />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Ban aria-hidden="true" className="size-3" />
                                                Diblokir
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            loading={unblockingId === user.id}
                                            onClick={() => unblock(user)}
                                            aria-label={`Buka blokir ${user.name}`}
                                            className="min-h-11"
                                        >
                                            Buka blokir
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
