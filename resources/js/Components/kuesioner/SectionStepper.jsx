import { Check } from 'lucide-react';
import { Progress } from '@/Components/ui';
import { cn } from '@/lib/utils';

/**
 * Penanda bagian kuesioner ("Bagian X dari N") dengan progres.
 * @param {{sections: Array<{name: string}>, currentIndex: number, onSelect?: (index: number) => void}} props
 */
export default function SectionStepper({ sections, currentIndex, onSelect }) {
    const total = sections.length;
    const current = sections[currentIndex];

    return (
        <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold tabular-nums text-foreground">
                    Bagian {currentIndex + 1} dari {total}
                </p>
                {current && <p className="truncate text-sm text-muted-foreground sm:hidden">{current.name}</p>}
            </div>
            <Progress value={currentIndex + 1} max={total} label="Progres pengisian kuesioner" valueText={`Bagian ${currentIndex + 1} dari ${total}`} />
            <ol className="hidden gap-2 sm:flex">
                {sections.map((section, index) => {
                    const isCurrent = index === currentIndex;
                    const isDone = index < currentIndex;
                    const itemClass = cn(
                        'flex min-h-11 w-full items-center gap-2 rounded-md px-2 text-left text-sm',
                        isCurrent ? 'font-semibold text-foreground' : 'text-muted-foreground'
                    );
                    const content = (
                        <>
                            <span
                                className={cn(
                                    'flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
                                    isCurrent && 'bg-primary text-primary-foreground',
                                    isDone && 'bg-success-soft text-success',
                                    !isCurrent && !isDone && 'bg-muted text-muted-foreground'
                                )}
                            >
                                {isDone ? <Check aria-hidden="true" className="size-3" strokeWidth={3} /> : index + 1}
                            </span>
                            <span className="truncate">{section.name}</span>
                        </>
                    );

                    return (
                        <li key={`${index}-${section.name}`} className="min-w-0 flex-1" aria-current={isCurrent ? 'step' : undefined}>
                            {onSelect && isDone ? (
                                <button
                                    type="button"
                                    onClick={() => onSelect(index)}
                                    className={cn(itemClass, 'transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring')}
                                >
                                    {content}
                                </button>
                            ) : (
                                <div className={itemClass}>{content}</div>
                            )}
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}
