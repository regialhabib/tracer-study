import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
    { key: 'upload', label: 'Unggah' },
    { key: 'preview', label: 'Pratinjau' },
    { key: 'result', label: 'Hasil' },
];

/**
 * Penunjuk langkah import: Unggah, Pratinjau, Hasil.
 *
 * Props:
 * - `current` kunci langkah aktif ('upload' | 'preview' | 'result').
 */
export default function ImportStepper({ current }) {
    const currentIndex = Math.max(
        0,
        STEPS.findIndex((step) => step.key === current),
    );

    return (
        <ol className="flex items-center gap-2" aria-label="Langkah import alumni">
            {STEPS.map((step, index) => {
                const isDone = index < currentIndex;
                const isCurrent = index === currentIndex;

                return (
                    <li
                        key={step.key}
                        className="flex flex-1 items-center gap-2 last:flex-none"
                        aria-current={isCurrent ? 'step' : undefined}
                    >
                        <span
                            className={cn(
                                'flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold',
                                isDone && 'border-primary bg-primary text-white',
                                isCurrent && 'border-primary bg-primary-soft text-primary',
                                !isDone && !isCurrent && 'border-border bg-card text-muted-foreground',
                            )}
                        >
                            {isDone ? <Check aria-hidden="true" className="size-4" /> : index + 1}
                        </span>
                        <span
                            className={cn(
                                'text-sm font-medium',
                                isCurrent ? 'text-foreground' : 'text-muted-foreground',
                            )}
                        >
                            {step.label}
                        </span>
                        {index < STEPS.length - 1 && (
                            <span
                                aria-hidden="true"
                                className={cn('h-px flex-1', isDone ? 'bg-primary' : 'bg-border')}
                            />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}
