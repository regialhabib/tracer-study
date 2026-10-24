import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, ClipboardCheck } from 'lucide-react';
import AlumniLayout from '@/Layouts/AlumniLayout';
import { Alert, AlertDescription, Badge, Button, Card, CardContent, CardHeader, toast } from '@/Components/ui';
import { AutosaveIndicator, QuestionRenderer, SectionStepper } from '@/Components/kuesioner';
import { draftStorageKey, readLocalDraft, useDraftAutosave } from '@/Components/alumni/kuesioner/useDraftAutosave';
import { isEmptyAnswer, resolveVisibility } from '@/lib/kuesioner';

const AUTOSAVE_DELAY_MS = 3000;
const REQUIRED_MESSAGE = 'Pertanyaan ini wajib diisi.';

/** Gabungkan draf lokal yang lebih baru daripada data server (KSN-12). */
function restoreInitialState({ kuesionerId, userId, serverUpdatedAt, serverAnswers, sections, currentSectionIndex }) {
    const local = readLocalDraft(draftStorageKey(kuesionerId, userId));
    const serverTime = serverUpdatedAt ? Date.parse(serverUpdatedAt) : 0;

    if (!local || !(local.savedAt > serverTime)) {
        return { answers: { ...serverAnswers }, sectionIndex: currentSectionIndex, restored: false };
    }

    const answers = { ...serverAnswers };

    for (const [id, value] of Object.entries(local.answers ?? {})) {
        if (isEmptyAnswer(value)) {
            delete answers[id];
        } else {
            answers[id] = value;
        }
    }

    const localIndex = sections.findIndex((section) => section.name === local.section);

    return { answers, sectionIndex: localIndex >= 0 ? localIndex : currentSectionIndex, restored: true };
}

export default function Show({ kuesioner, sections, answers: serverAnswers, currentSectionIndex, respon, userId }) {
    const initial = useMemo(
        () =>
            restoreInitialState({
                kuesionerId: kuesioner.id,
                userId,
                serverUpdatedAt: respon.updated_at,
                serverAnswers,
                sections,
                currentSectionIndex,
            }),
        // Dihitung sekali saat halaman dibuka.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const [answers, setAnswers] = useState(initial.answers);
    const [sectionIndex, setSectionIndex] = useState(initial.sectionIndex);
    const [errors, setErrors] = useState({});
    const [isNavigating, setIsNavigating] = useState(false);

    const { status, savedAt, save, flushLocal } = useDraftAutosave({
        kuesionerId: kuesioner.id,
        userId,
        serverUpdatedAt: respon.updated_at,
    });

    const allQuestions = useMemo(() => sections.flatMap((section) => section.questions), [sections]);
    const visibility = useMemo(() => resolveVisibility(allQuestions, answers), [allQuestions, answers]);

    const section = sections[sectionIndex];
    const visibleQuestions = section.questions.filter((question) => visibility[question.id]);
    const isLastSection = sectionIndex === sections.length - 1;
    const isRevision = respon.status === 'submitted';

    const latest = useRef({});
    latest.current = { answers, visibility, section };
    const debounceTimer = useRef(null);

    const buildPayload = useCallback((validate) => {
        const { answers: currentAnswers, visibility: currentVisibility, section: currentSection } = latest.current;
        const payloadAnswers = {};

        for (const question of currentSection.questions) {
            const value = currentAnswers[question.id];
            payloadAnswers[question.id] = currentVisibility[question.id] && !isEmptyAnswer(value) ? value : null;
        }

        return { section: currentSection.name, answers: payloadAnswers, validate };
    }, []);

    const cancelPendingAutosave = useCallback(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
            debounceTimer.current = null;
        }
    }, []);

    const scheduleAutosave = useCallback(() => {
        cancelPendingAutosave();
        debounceTimer.current = setTimeout(() => {
            debounceTimer.current = null;
            save(buildPayload(false));
        }, AUTOSAVE_DELAY_MS);
    }, [buildPayload, cancelPendingAutosave, save]);

    useEffect(() => {
        if (initial.restored) {
            flushLocal();
        }

        return cancelPendingAutosave;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (question, value) => {
        setAnswers((previous) => {
            const next = { ...previous };

            if (isEmptyAnswer(value)) {
                delete next[question.id];
            } else {
                next[question.id] = value;
            }

            const nextVisibility = resolveVisibility(allQuestions, next);

            for (const item of allQuestions) {
                if (!nextVisibility[item.id]) {
                    delete next[item.id];
                }
            }

            return next;
        });
        setErrors((previous) => {
            if (!previous[question.id]) {
                return previous;
            }

            const { [question.id]: removed, ...rest } = previous;

            return rest;
        });
        scheduleAutosave();
    };

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const focusFirstError = (errorMap) => {
        const firstId = visibleQuestions.find((question) => errorMap[question.id])?.id;

        if (firstId) {
            document.getElementById(`q-${firstId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const goToSection = (index) => {
        setErrors({});
        setSectionIndex(index);
        scrollToTop();
    };

    const handleBack = async (targetIndex = sectionIndex - 1) => {
        cancelPendingAutosave();
        setIsNavigating(true);
        await save(buildPayload(false));
        setIsNavigating(false);
        goToSection(targetIndex);
    };

    const handleNext = async () => {
        cancelPendingAutosave();

        const requiredErrors = {};

        for (const question of visibleQuestions) {
            if (question.is_required && isEmptyAnswer(answers[question.id])) {
                requiredErrors[question.id] = REQUIRED_MESSAGE;
            }
        }

        if (Object.keys(requiredErrors).length > 0) {
            setErrors(requiredErrors);
            focusFirstError(requiredErrors);

            return;
        }

        setIsNavigating(true);
        const result = await save(buildPayload(true));
        setIsNavigating(false);

        if (result.forbidden) {
            router.visit(route('alumni.kuesioner.index'));

            return;
        }

        if (result.errors) {
            const serverErrors = {};

            for (const [key, message] of Object.entries(result.errors)) {
                serverErrors[key.replace('answers.', '')] = Array.isArray(message) ? message[0] : message;
            }

            setErrors(serverErrors);
            focusFirstError(serverErrors);

            return;
        }

        if (!isLastSection) {
            goToSection(sectionIndex + 1);

            return;
        }

        if (result.ok) {
            router.visit(route('alumni.kuesioner.summary', kuesioner.id));
        } else {
            toast.error('Tidak ada koneksi. Jawaban tersimpan di perangkat ini; coba lagi saat Anda kembali online.');
        }
    };

    return (
        <AlumniLayout>
            <Head title={kuesioner.title} />

            <div className="mx-auto max-w-2xl space-y-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                        <Button asChild variant="ghost" size="sm" className="-ml-3">
                            <Link href={route('alumni.kuesioner.index')}>
                                <ArrowLeft aria-hidden="true" />
                                Daftar Kuesioner
                            </Link>
                        </Button>
                        <h1 className="text-xl font-semibold leading-snug tracking-tight text-foreground">{kuesioner.title}</h1>
                    </div>
                    <AutosaveIndicator status={status} savedAt={savedAt} />
                </div>

                {isRevision && (
                    <Alert variant="info" icon={ClipboardCheck}>
                        <AlertDescription>
                            Jawaban Anda sudah terkirim. Anda boleh merevisinya, lalu kirim ulang dari halaman ringkasan.
                        </AlertDescription>
                    </Alert>
                )}

                <SectionStepper
                    sections={sections}
                    currentIndex={sectionIndex}
                    onSelect={(index) => index < sectionIndex && handleBack(index)}
                />

                <Card>
                    <CardHeader>
                        <Badge variant="neutral" className="self-start">
                            {section.name}
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {visibleQuestions.map((question) => (
                            <QuestionRenderer
                                key={question.id}
                                question={question}
                                value={answers[question.id]}
                                onChange={(value) => handleChange(question, value)}
                                error={errors[question.id]}
                                disabled={isNavigating}
                            />
                        ))}
                    </CardContent>
                </Card>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                    <Button variant="outline" size="lg" disabled={sectionIndex === 0 || isNavigating} onClick={() => handleBack()}>
                        <ArrowLeft aria-hidden="true" />
                        Kembali
                    </Button>
                    <Button size="lg" loading={isNavigating} onClick={handleNext}>
                        {isLastSection ? 'Lihat Ringkasan' : 'Lanjut'}
                        <ArrowRight aria-hidden="true" />
                    </Button>
                </div>
            </div>
        </AlumniLayout>
    );
}
