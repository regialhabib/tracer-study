import { SendHorizontal } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import { Button } from '@/Components/ui';

const MAX_LENGTH = 2000;

/**
 * ChatInput — textarea auto-grow di bawah panel. Enter mengirim, Shift+Enter baris baru.
 * `onSend(body)` menerima teks yang sudah di-trim.
 */
export default function ChatInput({ onSend }) {
    const [value, setValue] = useState('');
    const textareaRef = useRef(null);
    const trimmed = value.trim();
    const canSend = trimmed.length > 0 && value.length <= MAX_LENGTH;

    useLayoutEffect(() => {
        const element = textareaRef.current;

        if (element) {
            element.style.height = 'auto';
            element.style.height = `${Math.min(element.scrollHeight, 144)}px`;
        }
    }, [value]);

    const submit = () => {
        if (!canSend) {
            return;
        }

        onSend(trimmed);
        setValue('');
        textareaRef.current?.focus();
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            submit();
        }
    };

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                submit();
            }}
            className="shrink-0 border-t border-border bg-card p-3"
        >
            <div className="flex items-end gap-2">
                <div className="min-w-0 flex-1">
                    <label htmlFor="pesan-input" className="sr-only">
                        Tulis pesan
                    </label>
                    <textarea
                        id="pesan-input"
                        ref={textareaRef}
                        value={value}
                        rows={1}
                        maxLength={MAX_LENGTH}
                        onChange={(event) => setValue(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Tulis pesan..."
                        className="block max-h-36 min-h-11 w-full resize-none rounded-md border border-input bg-card px-3 py-2.5 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/25"
                    />
                </div>
                <Button type="submit" size="icon" disabled={!canSend} aria-label="Kirim pesan" className="size-11 shrink-0">
                    <SendHorizontal aria-hidden="true" />
                </Button>
            </div>
            {value.length > MAX_LENGTH - 200 && (
                <p className="mt-1 text-right text-xs tabular-nums text-muted-foreground">
                    {value.length.toLocaleString('id-ID')}/{MAX_LENGTH.toLocaleString('id-ID')}
                </p>
            )}
        </form>
    );
}
