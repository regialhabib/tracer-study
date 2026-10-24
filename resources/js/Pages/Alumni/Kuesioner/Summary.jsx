import { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Send } from 'lucide-react';
import AlumniLayout from '@/Layouts/AlumniLayout';
import { Alert, AlertDescription, AlertTitle, Button } from '@/Components/ui';
import { AnswerSummary } from '@/Components/kuesioner';
import { resolveVisibility } from '@/lib/kuesioner';

export default function Summary({ kuesioner, sections, answers, incompleteSections, respon }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const visibility = useMemo(
        () => resolveVisibility(sections.flatMap((section) => section.questions), answers),
        [sections, answers],
    );

    const editSection = (index) => router.visit(route('alumni.kuesioner.show', { kuesioner: kuesioner.id, bagian: index }));

    const submit = () =>
        router.post(
            route('alumni.kuesioner.submit', kuesioner.id),
            {},
            { onStart: () => setIsSubmitting(true), onFinish: () => setIsSubmitting(false) },
        );

    const isRevision = respon.status === 'submitted';

    return (
        <AlumniLayout>
            <Head title="Ringkasan Jawaban" />

            <div className="mx-auto max-w-2xl space-y-4">
                <div className="space-y-1">
                    <Button asChild variant="ghost" size="sm" className="-ml-3">
                        <Link href={route('alumni.kuesioner.show', kuesioner.id)}>
                            <ArrowLeft aria-hidden="true" />
                            Kembali ke Pengisian
                        </Link>
                    </Button>
                    <h1 className="text-xl font-semibold leading-snug tracking-tight text-foreground">Ringkasan Jawaban</h1>
                    <p className="text-sm text-muted-foreground">
                        Periksa kembali jawaban Anda untuk &ldquo;{kuesioner.title}&rdquo; sebelum {isRevision ? 'mengirim ulang' : 'mengirim'}.
                    </p>
                </div>

                {incompleteSections.length > 0 && (
                    <Alert variant="warning">
                        <AlertTitle>Masih ada pertanyaan yang perlu dilengkapi</AlertTitle>
                        <AlertDescription>
                            <ul className="mt-2 space-y-1">
                                {incompleteSections.map((item) => (
                                    <li key={item.index}>
                                        <button
                                            type="button"
                                            onClick={() => editSection(item.index)}
                                            className="min-h-11 rounded-sm text-left font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            {item.name}
                                        </button>{' '}
                                        ({item.count} pertanyaan)
                                    </li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                <AnswerSummary sections={sections} answers={answers} visibility={visibility} onEditSection={editSection} />

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                    <Button asChild variant="outline" size="lg">
                        <Link href={route('alumni.kuesioner.show', kuesioner.id)}>Kembali ke Pengisian</Link>
                    </Button>
                    <Button size="lg" loading={isSubmitting} onClick={submit}>
                        <Send aria-hidden="true" />
                        {isRevision ? 'Kirim Ulang Jawaban' : 'Kirim Jawaban'}
                    </Button>
                </div>
            </div>
        </AlumniLayout>
    );
}
