import { useEffect, useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronDown, Copy, Eye, Lock, MousePointerClick, Plus, Power, Settings2 } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Alert, AlertDescription, Badge, Button, Card, CardContent, Input, PageHeader } from '@/Components/ui';
import { KUESIONER_STATUS_BADGE_VARIANTS, KUESIONER_STATUS_LABELS } from '@/lib/kuesioner';
import KuesionerMetaForm from '@/Components/admin/kuesioner/KuesionerMetaForm';
import QuestionBoard from '@/Components/admin/kuesioner/QuestionBoard';
import QuestionSettingsPanel from '@/Components/admin/kuesioner/QuestionSettingsPanel';
import StatusChangeDialog from '@/Components/admin/kuesioner/StatusChangeDialog';
import { STATUS_ACTIONS, formatDate, formatTargets, nextStatusTargets } from '@/Components/admin/kuesioner/statusActions';

function useIsDesktop() {
    const query = '(min-width: 1024px)';
    const [matches, setMatches] = useState(() => (typeof window === 'undefined' ? true : window.matchMedia(query).matches));

    useEffect(() => {
        const media = window.matchMedia(query);
        const update = () => setMatches(media.matches);

        media.addEventListener('change', update);

        return () => media.removeEventListener('change', update);
    }, []);

    return matches;
}

/** Gabungkan bagian dari server dengan bagian kosong yang hanya ada di klien. */
function mergeSections(serverSections, previous) {
    const names = new Set(serverSections.map((section) => section.name));
    const clientOnly = previous.filter((section) => section.questions.length === 0 && !names.has(section.name));

    return [...serverSections, ...clientOnly];
}

export default function Edit({ kuesioner, sections: serverSections, isStructureLocked, questionTypes, metricKeys, newQuestionId, errors = {} }) {
    const isDesktop = useIsDesktop();
    const [sections, setSections] = useState(serverSections);
    const [editor, setEditor] = useState(null);
    const [showMeta, setShowMeta] = useState(false);
    const [addingSection, setAddingSection] = useState(false);
    const [sectionName, setSectionName] = useState('');
    const [sectionError, setSectionError] = useState(null);
    const [statusTarget, setStatusTarget] = useState(null);

    useEffect(() => {
        setSections((previous) => mergeSections(serverSections, previous));
    }, [serverSections]);

    useEffect(() => {
        if (newQuestionId) {
            setEditor({ kind: 'edit', id: newQuestionId });
        }
    }, [newQuestionId]);

    const flatQuestions = useMemo(() => sections.flatMap((section) => section.questions), [sections]);
    const usedMetricKeys = flatQuestions.map((question) => question.metric_key).filter(Boolean);
    const selectedQuestion = editor?.kind === 'edit' ? flatQuestions.find((question) => question.id === editor.id) ?? null : null;

    useEffect(() => {
        if (editor?.kind === 'edit' && !selectedQuestion) {
            setEditor(null);
        }
    }, [editor, selectedQuestion]);

    const earlierFor = (questionId) => {
        const index = flatQuestions.findIndex((question) => question.id === questionId);

        return index < 0 ? [] : flatQuestions.slice(0, index);
    };

    const earlierForNew = (sectionNameValue) => {
        const section = sections.find((item) => item.name === sectionNameValue);

        if (!section || section.questions.length === 0) {
            return flatQuestions;
        }

        const lastId = section.questions[section.questions.length - 1].id;

        return flatQuestions.slice(0, flatQuestions.findIndex((question) => question.id === lastId) + 1);
    };

    const renderPanel = (panelQuestion, section) => (
        <QuestionSettingsPanel
            key={panelQuestion ? `edit-${panelQuestion.id}` : `new-${section}`}
            kuesionerId={kuesioner.id}
            question={panelQuestion}
            section={section}
            earlierQuestions={panelQuestion ? earlierFor(panelQuestion.id) : earlierForNew(section)}
            usedMetricKeys={usedMetricKeys}
            isLocked={isStructureLocked}
            questionTypes={questionTypes}
            metricKeys={metricKeys}
            onClose={() => setEditor(null)}
        />
    );

    const renderInlinePanel = (children) => (
        <div className="rounded-lg border border-border bg-card p-4">{children}</div>
    );

    const renderQuestionPanel = (questionId) =>
        !isDesktop && editor?.kind === 'edit' && editor.id === questionId && selectedQuestion
            ? renderInlinePanel(renderPanel(selectedQuestion, selectedQuestion.section))
            : null;

    const renderNewPanel = (name) =>
        !isDesktop && editor?.kind === 'new' && editor.section === name ? renderInlinePanel(renderPanel(null, name)) : null;

    const renameSection = (from, to) => {
        if (to === '') {
            return 'Nama bagian wajib diisi.';
        }

        if (to === from) {
            return null;
        }

        if (sections.some((section) => section.name === to)) {
            return 'Nama bagian sudah dipakai.';
        }

        const current = sections.find((section) => section.name === from);

        if (current && current.questions.length > 0) {
            router.patch(route('admin.kuesioner.bagian.update', kuesioner.id), { from, to }, { preserveScroll: true });
        } else {
            setSections((previous) => previous.map((section) => (section.name === from ? { ...section, name: to } : section)));
        }

        return null;
    };

    const addSection = (event) => {
        event.preventDefault();
        const name = sectionName.trim();

        if (name === '') {
            setSectionError('Nama bagian wajib diisi.');

            return;
        }

        if (sections.some((section) => section.name === name)) {
            setSectionError('Nama bagian sudah dipakai.');

            return;
        }

        setSections((previous) => [...previous, { name, questions: [] }]);
        setSectionName('');
        setSectionError(null);
        setAddingSection(false);
        setEditor({ kind: 'new', section: name });
    };

    const duplicate = () => router.post(route('admin.kuesioner.duplicate', kuesioner.id));

    const topError = errors.items ?? errors.status ?? errors.from ?? errors.to;
    const targets = nextStatusTargets(kuesioner.status);
    const showEmptyHint = sections.length === 0;

    return (
        <AdminLayout title={kuesioner.title}>
            <Head title={`Sunting ${kuesioner.title}`} />

            <div className="flex flex-col gap-6">
                <PageHeader
                    title={kuesioner.title}
                    description={`Periode ${formatDate(kuesioner.start_date)} – ${formatDate(kuesioner.end_date)} · ${formatTargets(kuesioner.target_graduation_years)}`}
                    actions={
                        <>
                            <Button asChild variant="outline">
                                <Link href={route('admin.kuesioner.preview', kuesioner.id)}>
                                    <Eye aria-hidden="true" />
                                    Pratinjau
                                </Link>
                            </Button>
                            <Button type="button" variant="outline" onClick={duplicate}>
                                <Copy aria-hidden="true" />
                                Duplikat
                            </Button>
                            {targets.map((target) => (
                                <Button key={target} type="button" onClick={() => setStatusTarget(target)}>
                                    <Power aria-hidden="true" />
                                    {STATUS_ACTIONS[target].label}
                                </Button>
                            ))}
                        </>
                    }
                >
                    <Badge variant={KUESIONER_STATUS_BADGE_VARIANTS[kuesioner.status] ?? 'neutral'}>
                        {KUESIONER_STATUS_LABELS[kuesioner.status] ?? kuesioner.status}
                    </Badge>
                </PageHeader>

                {isStructureLocked && (
                    <Alert variant="warning" icon={Lock}>
                        <AlertDescription>
                            Struktur terkunci karena sudah ada jawaban. Anda hanya dapat mengubah teks pertanyaan, teks bantuan, label opsi, dan nama bagian.
                        </AlertDescription>
                    </Alert>
                )}

                {topError && (
                    <Alert variant="danger">
                        <AlertDescription>{topError}</AlertDescription>
                    </Alert>
                )}

                <Card>
                    <button
                        type="button"
                        onClick={() => setShowMeta((value) => !value)}
                        aria-expanded={showMeta}
                        className="flex min-h-11 w-full items-center justify-between gap-2 rounded-xl px-5 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <span className="flex items-center gap-2 font-semibold text-foreground">
                            <Settings2 aria-hidden="true" className="size-4" />
                            Pengaturan Kuesioner
                        </span>
                        <ChevronDown aria-hidden="true" className={`size-4 text-muted-foreground transition-transform ${showMeta ? 'rotate-180' : ''}`} />
                    </button>
                    {showMeta && (
                        <CardContent className="border-t border-border pt-5">
                            <KuesionerMetaForm kuesioner={kuesioner} />
                        </CardContent>
                    )}
                </Card>

                <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
                    <div className="flex min-w-0 flex-col gap-4">
                        {showEmptyHint && (
                            <Card>
                                <CardContent className="pt-5 text-sm text-muted-foreground">
                                    Belum ada bagian. Tambahkan bagian pertama untuk mulai menyusun pertanyaan.
                                </CardContent>
                            </Card>
                        )}

                        <QuestionBoard
                            kuesionerId={kuesioner.id}
                            sections={sections}
                            setSections={setSections}
                            isLocked={isStructureLocked}
                            selectedId={editor?.kind === 'edit' ? editor.id : null}
                            onSelect={(id) => setEditor((current) => (current?.kind === 'edit' && current.id === id ? null : { kind: 'edit', id }))}
                            onAddQuestion={(name) => setEditor({ kind: 'new', section: name })}
                            onRenameSection={renameSection}
                            onRemoveSection={(name) => setSections((previous) => previous.filter((section) => section.name !== name))}
                            renderQuestionPanel={renderQuestionPanel}
                            renderNewPanel={renderNewPanel}
                        />

                        {!isStructureLocked &&
                            (addingSection ? (
                                <form onSubmit={addSection} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
                                    <label htmlFor="new-section" className="text-sm font-medium text-foreground">
                                        Nama Bagian Baru
                                    </label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="new-section"
                                            value={sectionName}
                                            maxLength={100}
                                            invalid={Boolean(sectionError)}
                                            placeholder="Contoh: Pekerjaan"
                                            onChange={(event) => setSectionName(event.target.value)}
                                        />
                                        <Button type="submit">Tambah Bagian</Button>
                                        <Button type="button" variant="ghost" onClick={() => setAddingSection(false)}>
                                            Batal
                                        </Button>
                                    </div>
                                    {sectionError && <p className="text-sm font-medium text-danger">{sectionError}</p>}
                                </form>
                            ) : (
                                <div>
                                    <Button type="button" variant="outline" onClick={() => setAddingSection(true)}>
                                        <Plus aria-hidden="true" />
                                        Tambah Bagian
                                    </Button>
                                </div>
                            ))}
                    </div>

                    {isDesktop && (
                        <aside className="sticky top-4 min-w-0" aria-label="Panel pengaturan pertanyaan">
                            <Card>
                                <CardContent className="pt-5">
                                    {editor?.kind === 'edit' && selectedQuestion ? (
                                        renderPanel(selectedQuestion, selectedQuestion.section)
                                    ) : editor?.kind === 'new' ? (
                                        renderPanel(null, editor.section)
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
                                            <MousePointerClick aria-hidden="true" className="size-6" />
                                            <p>Pilih sebuah pertanyaan untuk mengatur teks, tipe, opsi, dan logikanya.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </aside>
                    )}
                </div>
            </div>

            <StatusChangeDialog kuesioner={statusTarget ? kuesioner : null} target={statusTarget} onClose={() => setStatusTarget(null)} />
        </AdminLayout>
    );
}
