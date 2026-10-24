import { Check, CheckCheck, CircleAlert, Clock, RotateCcw, Trash2 } from 'lucide-react';
import { formatTime } from '@/lib/pesan/format';
import { cn } from '@/lib/utils';

/**
 * ChatBubble — satu gelembung pesan.
 * `message.status` ('sending' | 'failed') hanya ada pada pesan optimistik; `message.error` teks kegagalan.
 */
export default function ChatBubble({ message, isOwn, onRetry, onDiscard }) {
    const isSending = message.status === 'sending';
    const isFailed = message.status === 'failed';

    return (
        <div className={cn('flex flex-col', isOwn ? 'items-end' : 'items-start')}>
            <div
                className={cn(
                    'max-w-[85%] rounded-lg px-3 py-2 sm:max-w-[75%]',
                    isOwn ? 'rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm bg-muted text-foreground',
                    isSending && 'opacity-70',
                    isFailed && 'bg-danger-soft text-danger',
                )}
            >
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed [overflow-wrap:anywhere]">{message.body}</p>
                <p
                    className={cn(
                        'mt-1 flex items-center justify-end gap-1 text-[11px] tabular-nums',
                        isOwn && !isFailed ? 'text-primary-foreground/80' : 'text-muted-foreground',
                        isFailed && 'text-danger',
                    )}
                >
                    {isSending ? (
                        <>
                            <Clock aria-hidden="true" className="size-3" />
                            Mengirim
                        </>
                    ) : isFailed ? (
                        <>
                            <CircleAlert aria-hidden="true" className="size-3" />
                            Gagal terkirim
                        </>
                    ) : (
                        <>
                            {formatTime(message.created_at)}
                            {isOwn &&
                                (message.is_read ? (
                                    <>
                                        <CheckCheck aria-hidden="true" className="size-3.5" />
                                        <span className="sr-only">Sudah dibaca</span>
                                    </>
                                ) : (
                                    <>
                                        <Check aria-hidden="true" className="size-3.5" />
                                        <span className="sr-only">Terkirim</span>
                                    </>
                                ))}
                        </>
                    )}
                </p>
            </div>
            {isFailed && (
                <div className="mt-1 flex max-w-[85%] flex-col items-end gap-1 sm:max-w-[75%]">
                    {message.error && <p className="text-right text-xs text-danger">{message.error}</p>}
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => onRetry?.(message)}
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-brand-blue hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <RotateCcw aria-hidden="true" className="size-3.5" />
                            Coba lagi
                        </button>
                        <button
                            type="button"
                            onClick={() => onDiscard?.(message)}
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <Trash2 aria-hidden="true" className="size-3.5" />
                            Hapus
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
