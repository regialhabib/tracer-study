import { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, ClipboardList, Monitor, Pencil, RotateCcw, Smartphone } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Alert, AlertDescription, Button, Card, CardContent, EmptyState, PageHeader } from '@/Components/ui';
import { QuestionRenderer, SectionStepper } from '@/Components/kuesioner';
import { resolveVisibility } from '@/lib/kuesioner';

const FRAMES = [
    { key: 'phone', label: 'Ponsel (360px)', icon: Smartphone, className: 'w-[360px] max-w-full' },
    { key: 'desktop', label: 'Desktop', icon: Monitor, className: 'w-full max-w-3xl' },
];

export default function Preview({ kuesioner, sections }) {
    const [frame, setFrame] = useState('phone');
    const [answers, setAnswers] = useState({});
    const [sectionIndex, setSectionIndex] = useState(0);
    const [finished, setFinished] = useState(false);

    const allQuestions = useMemo(() => sections.flatMap((section) => section.questions), [sections]);
    const visibility = useMemo(() => resolveVisibility(allQuestions, answers), [allQuestions, answers]);
    const visibleSections = useMemo(
        () =>
            sections
                .map((section) => ({ ...section, visibleQuestions: section.questions.filter((question) => visibility[question.id]) }))
                .filter((section) => section.visibleQuestions.length > 0),
        [sections, visibility],
    );

    const currentIndex = Math.min(sectionIndex, Math.max(visibleSections.length - 1, 0));
    const current = visibleSections[currentIndex];
    const isLast = currentIndex >= visibleSections.length - 1;
    const frameConfig = FRAMES.find((item) => item.key === frame);

    const reset = () => {
        setAnswers({});
        setSectionIndex(0);
        setFinished(false);
    };

    return (
        <AdminLayout title="Pratinjau Kuesioner">
            <Head title={`Pratinjau ${kuesioner.title}`} />

            <div className="flex flex-col gap-6">
                <PageHeader
                    title={`Pratinjau: ${kuesioner.title}`}
                    description="Jawaban yang Anda isi di sini hanya untuk mencoba tampilan dan tidak disimpan."
                    actions={
                        <>
                            <Button type="button" variant="outline" onClick={reset}>
                                <RotateCcw aria-hidden="true" />
                                Ulangi Pratinjau
                            </Button>
                            <Button asChild>
                                <Link href={route('admin.kuesioner.edit', kuesioner.id)}>
                                    <Pencil aria-hidden="true" />
                                    Kembali Menyunting
                                </Link>
                            </Button>
                        </>
                    }
                />

                <div className="flex flex-wrap gap-2" role="group" aria-label="Ukuran bingkai pratinjau">
                    {FRAMES.map((item) => (
                        <Button
                            key={item.key}
                            type="button"
                            variant={frame === item.key ? 'default' : 'outline'}
                            aria-pressed={frame === item.key}
                            onClick={() => setFrame(item.key)}
                        >
                            <item.icon aria-hidden="true" />
                            {item.label}
                        </Button>
                    ))}
                </div>

                <div className="flex justify-center rounded-xl bg-muted p-3 sm:p-6">
                    <div className={`${frameConfig.className} overflow-hidden rounded-xl border border-border bg-background`}>
                        {visibleSections.length === 0 ? (
                            <EmptyState
                                icon={ClipboardList}
                                title="Belum ada pertanyaan"
                                description="Tambahkan pertanyaan di halaman sunting untuk melihat pratinjau."
                            />
                        ) : (
                            <div className="flex flex-col gap-5 p-4 sm:p-5">
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">{kuesioner.title}</h2>
                                    {kuesioner.description && <p className="mt-1 text-sm text-muted-foreground">{kuesioner.description}</p>}
                                </div>

                                <SectionStepper
                                    sections={visibleSections}
                                    currentIndex={currentIndex}
                                    onSelect={(index) => {
                                        setFinished(false);
                                        setSectionIndex(index);
                                    }}
                                />

                                {finished ? (
                                    <Alert variant="success">
                                        <AlertDescription>
                                            Pratinjau selesai. Pada kuesioner sebenarnya alumni akan melihat ringkasan sebelum mengirim jawaban.
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <Card>
                                        <CardContent className="flex flex-col gap-6 pt-5">
                                            <h3 className="text-base font-semibold text-foreground">{current.name}</h3>
                                            {current.visibleQuestions.map((question) => (
                                                <QuestionRenderer
                                                    key={question.id}
                                                    question={question}
                                                    value={answers[question.id]}
                                                    onChange={(value) => setAnswers((previous) => ({ ...previous, [question.id]: value }))}
                                                />
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}

                                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={currentIndex === 0 && !finished}
                                        onClick={() => (finished ? setFinished(false) : setSectionIndex(currentIndex - 1))}
                                    >
                                        <ArrowLeft aria-hidden="true" />
                                        Kembali
                                    </Button>
                                    {!finished && (
                                        <Button type="button" onClick={() => (isLast ? setFinished(true) : setSectionIndex(currentIndex + 1))}>
                                            {isLast ? 'Selesai Pratinjau' : 'Lanjut'}
                                            {!isLast && <ArrowRight aria-hidden="true" />}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
