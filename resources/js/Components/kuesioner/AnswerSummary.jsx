import { Pencil } from 'lucide-react';
import { Button } from '@/Components/ui';
import { formatAnswer } from '@/lib/kuesioner';

/**
 * Ringkasan jawaban per bagian.
 * @param {{sections: Array<{name: string, questions: object[]}>, answers: Record<number, any>, visibility: Record<number, boolean>, onEditSection?: (index: number) => void}} props
 */
export default function AnswerSummary({ sections, answers, visibility = {}, onEditSection }) {
    return (
        <div className="space-y-4">
            {sections.map((section, index) => {
                const visibleQuestions = section.questions.filter((question) => visibility[question.id] !== false);

                return (
                    <section key={`${index}-${section.name}`} aria-labelledby={`ringkasan-bagian-${index}`} className="rounded-lg border border-border bg-card">
                        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2">
                            <h3 id={`ringkasan-bagian-${index}`} className="min-w-0 truncate text-base font-semibold text-foreground">
                                {section.name}
                            </h3>
                            {onEditSection && (
                                <Button type="button" variant="ghost" size="sm" className="min-h-11 shrink-0" onClick={() => onEditSection(index)}>
                                    <Pencil aria-hidden="true" />
                                    Ubah<span className="sr-only"> bagian {section.name}</span>
                                </Button>
                            )}
                        </div>
                        <dl className="divide-y divide-border">
                            {visibleQuestions.map((question) => {
                                const formatted = formatAnswer(question, answers[question.id]);

                                return (
                                    <div key={question.id} className="space-y-1 px-4 py-3">
                                        <dt className="text-sm text-muted-foreground">{question.question_text}</dt>
                                        <dd className={formatted === null ? 'text-sm italic text-muted-foreground' : 'whitespace-pre-line break-words text-base text-foreground'}>
                                            {formatted ?? 'Belum dijawab'}
                                        </dd>
                                    </div>
                                );
                            })}
                            {visibleQuestions.length === 0 && <p className="px-4 py-3 text-sm text-muted-foreground">Tidak ada pertanyaan pada bagian ini.</p>}
                        </dl>
                    </section>
                );
            })}
        </div>
    );
}
