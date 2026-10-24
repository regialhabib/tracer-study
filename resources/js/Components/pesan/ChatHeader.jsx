import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Ban, EllipsisVertical, ShieldOff } from 'lucide-react';
import { useState } from 'react';
import {
    Badge,
    Button,
    Dialog,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui';
import ParticipantAvatar from './ParticipantAvatar';

/** ChatHeader — bar atas percakapan: kembali (mobile), identitas lawan bicara, menu blokir. */
export default function ChatHeader({ other, canBlock, isBlockedByMe }) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const subtitle = other.is_admin
        ? 'Pengurus'
        : [other.angkatan ? `Angkatan ${other.angkatan}` : null, other.major].filter(Boolean).join(' · ');

    const confirm = () => {
        const options = {
            preserveScroll: true,
            onStart: () => setIsProcessing(true),
            onFinish: () => {
                setIsProcessing(false);
                setIsConfirmOpen(false);
            },
        };

        if (isBlockedByMe) {
            router.delete(route('pesan.blokir.destroy', other.id), options);
        } else {
            router.post(route('pesan.blokir.store', other.id), {}, options);
        }
    };

    return (
        <header className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-2 py-2 sm:px-3">
            <Link
                href={route('pesan.index')}
                aria-label="Kembali ke daftar percakapan"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
            >
                <ArrowLeft aria-hidden="true" className="size-5" />
            </Link>
            <ParticipantAvatar participant={other} />
            <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2">
                    <span className="truncate text-sm font-bold text-foreground">{other.name}</span>
                    {other.is_admin && (
                        <Badge variant="info" className="shrink-0">
                            Admin
                        </Badge>
                    )}
                </p>
                {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
            </div>

            {canBlock && (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            aria-label="Menu percakapan"
                            className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <EllipsisVertical aria-hidden="true" className="size-5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem
                                icon={isBlockedByMe ? ShieldOff : Ban}
                                destructive={!isBlockedByMe}
                                onClick={() => setIsConfirmOpen(true)}
                            >
                                {isBlockedByMe ? 'Buka blokir' : 'Blokir pengguna'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Dialog open={isConfirmOpen} onClose={() => !isProcessing && setIsConfirmOpen(false)} size="sm">
                        <DialogHeader>
                            <DialogTitle>{isBlockedByMe ? `Buka blokir ${other.name}?` : `Blokir ${other.name}?`}</DialogTitle>
                            <DialogDescription>
                                {isBlockedByMe
                                    ? 'Anda dan pengguna ini dapat saling berkirim pesan lagi.'
                                    : 'Pengguna ini tidak akan bisa mengirim pesan kepada Anda. Anda bisa membuka blokir kapan saja.'}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsConfirmOpen(false)} disabled={isProcessing}>
                                Batal
                            </Button>
                            <Button
                                variant={isBlockedByMe ? 'default' : 'destructive'}
                                onClick={confirm}
                                loading={isProcessing}
                            >
                                {isBlockedByMe ? 'Buka blokir' : 'Blokir'}
                            </Button>
                        </DialogFooter>
                    </Dialog>
                </>
            )}
        </header>
    );
}
