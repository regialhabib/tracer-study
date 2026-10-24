import { useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    closestCorners,
    useDroppable,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, GitBranch, GripVertical, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Badge, Button, Card, CardContent, FieldError, Input } from '@/Components/ui';
import { METRIC_KEY_LABELS, QUESTION_TYPE_LABELS } from '@/lib/kuesioner';

const containerId = (name) => `section:${name}`;

function QuestionRow({ question, number, selected, dragDisabled, onSelect }) {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
        id: question.id,
        disabled: dragDisabled,
    });

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={`flex items-stretch gap-1 rounded-lg border bg-card ${selected ? 'border-primary bg-primary-soft' : 'border-border'} ${isDragging ? 'z-10 opacity-70 shadow-lg' : ''}`}
        >
            <button
                type="button"
                ref={setActivatorNodeRef}
                disabled={dragDisabled}
                aria-label={`Geser pertanyaan ${number}`}
                className="flex min-h-11 w-11 shrink-0 cursor-grab touch-none items-center justify-center rounded-l-lg text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
                {...attributes}
                {...listeners}
            >
                <GripVertical aria-hidden="true" className="size-5" />
            </button>
            <button
                type="button"
                onClick={() => onSelect(question.id)}
                aria-pressed={selected}
                className="flex min-h-11 min-w-0 flex-1 flex-col items-start gap-1.5 rounded-r-lg py-2.5 pr-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                <span className="text-sm font-medium text-foreground">
                    {number}. {question.question_text}
                </span>
                <span className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="neutral">{QUESTION_TYPE_LABELS[question.question_type] ?? question.question_type}</Badge>
                    {question.is_required && <Badge variant="info">Wajib</Badge>}
                    {question.metric_key && <Badge variant="success">{METRIC_KEY_LABELS[question.metric_key] ?? question.metric_key}</Badge>}
                    {question.conditional_rule && (
                        <Badge variant="warning">
                            <GitBranch aria-hidden="true" className="mr-1 size-3" />
                            Kondisional
                        </Badge>
                    )}
                </span>
            </button>
        </div>
    );
}

function SectionBlock({
    section,
    startNumber,
    selectedId,
    dragDisabled,
    onSelect,
    onAddQuestion,
    onRename,
    onRemove,
    renderQuestionPanel,
    renderNewPanel,
}) {
    const { setNodeRef, isOver } = useDroppable({ id: containerId(section.name), disabled: dragDisabled });
    const [renaming, setRenaming] = useState(false);
    const [name, setName] = useState(section.name);
    const [error, setError] = useState(null);

    const save = () => {
        const message = onRename(section.name, name.trim());

        if (message) {
            setError(message);
        } else {
            setError(null);
            setRenaming(false);
        }
    };

    return (
        <Card>
            <CardContent className="flex flex-col gap-3 pt-4">
                <div className="flex items-center justify-between gap-2">
                    {renaming ? (
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                            <Input
                                aria-label="Nama bagian"
                                value={name}
                                maxLength={100}
                                invalid={Boolean(error)}
                                onChange={(event) => setName(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                        save();
                                    }
                                }}
                            />
                            <Button type="button" size="icon" aria-label="Simpan nama bagian" onClick={save}>
                                <Check aria-hidden="true" />
                            </Button>
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                aria-label="Batal ganti nama"
                                onClick={() => {
                                    setRenaming(false);
                                    setName(section.name);
                                    setError(null);
                                }}
                            >
                                <X aria-hidden="true" />
                            </Button>
                        </div>
                    ) : (
                        <>
                            <h2 className="min-w-0 text-base font-semibold text-foreground">
                                {section.name}
                                <span className="ml-2 text-sm font-normal text-muted-foreground">({section.questions.length} pertanyaan)</span>
                            </h2>
                            <div className="flex shrink-0 items-center gap-1">
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    aria-label={`Ganti nama bagian ${section.name}`}
                                    onClick={() => {
                                        setName(section.name);
                                        setRenaming(true);
                                    }}
                                >
                                    <Pencil aria-hidden="true" />
                                </Button>
                                {section.questions.length === 0 && (
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        aria-label={`Hapus bagian kosong ${section.name}`}
                                        onClick={() => onRemove(section.name)}
                                    >
                                        <Trash2 aria-hidden="true" />
                                    </Button>
                                )}
                            </div>
                        </>
                    )}
                </div>
                <FieldError message={error} />

                <SortableContext items={section.questions.map((question) => question.id)} strategy={verticalListSortingStrategy}>
                    <div
                        ref={setNodeRef}
                        className={`flex min-h-14 flex-col gap-2 rounded-lg ${section.questions.length === 0 ? 'items-center justify-center border border-dashed border-border p-3 text-sm text-muted-foreground' : ''} ${isOver ? 'bg-primary-soft' : ''}`}
                    >
                        {section.questions.length === 0 && <span>Bagian ini masih kosong. Tambahkan atau seret pertanyaan ke sini.</span>}
                        {section.questions.map((question, index) => (
                            <div key={question.id} className="flex flex-col gap-2">
                                <QuestionRow
                                    question={question}
                                    number={startNumber + index}
                                    selected={selectedId === question.id}
                                    dragDisabled={dragDisabled}
                                    onSelect={onSelect}
                                />
                                {renderQuestionPanel(question.id)}
                            </div>
                        ))}
                    </div>
                </SortableContext>

                {!dragDisabled && (
                    <div>
                        <Button type="button" variant="outline" size="sm" onClick={() => onAddQuestion(section.name)}>
                            <Plus aria-hidden="true" />
                            Tambah Pertanyaan
                        </Button>
                    </div>
                )}
                {renderNewPanel(section.name)}
            </CardContent>
        </Card>
    );
}

/**
 * Daftar bagian & pertanyaan dengan drag & drop (@dnd-kit), termasuk pindah antar-bagian.
 * Komponen ini memegang interaksi seret; state `sections` dimiliki halaman Edit.
 */
export default function QuestionBoard({
    kuesionerId,
    sections,
    setSections,
    isLocked,
    selectedId,
    onSelect,
    onAddQuestion,
    onRenameSection,
    onRemoveSection,
    renderQuestionPanel,
    renderNewPanel,
}) {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );
    const snapshot = useRef('');

    const signature = (list) => list.map((section) => `${section.name}:${section.questions.map((question) => question.id).join(',')}`).join('|');

    const findContainer = (id) => {
        if (typeof id === 'string' && id.startsWith('section:')) {
            return id.slice('section:'.length);
        }

        return sections.find((section) => section.questions.some((question) => question.id === id))?.name;
    };

    const handleDragOver = ({ active, over }) => {
        if (!over) {
            return;
        }

        const from = findContainer(active.id);
        const to = findContainer(over.id);

        if (!from || !to || from === to) {
            return;
        }

        setSections((previous) => {
            const moving = previous.find((section) => section.name === from)?.questions.find((question) => question.id === active.id);

            if (!moving) {
                return previous;
            }

            return previous.map((section) => {
                if (section.name === from) {
                    return { ...section, questions: section.questions.filter((question) => question.id !== active.id) };
                }

                if (section.name === to) {
                    const overIndex = section.questions.findIndex((question) => question.id === over.id);
                    const insertAt = overIndex >= 0 ? overIndex : section.questions.length;

                    return { ...section, questions: [...section.questions.slice(0, insertAt), moving, ...section.questions.slice(insertAt)] };
                }

                return section;
            });
        });
    };

    const handleDragEnd = ({ active, over }) => {
        let next = sections;

        if (over) {
            const container = findContainer(active.id);

            if (container && container === findContainer(over.id)) {
                const section = sections.find((item) => item.name === container);
                const oldIndex = section.questions.findIndex((question) => question.id === active.id);
                const newIndex = section.questions.findIndex((question) => question.id === over.id);

                if (newIndex >= 0 && oldIndex !== newIndex) {
                    next = sections.map((item) =>
                        item.name === container ? { ...item, questions: arrayMove(item.questions, oldIndex, newIndex) } : item,
                    );
                    setSections(next);
                }
            }
        }

        if (signature(next) === snapshot.current) {
            return;
        }

        const items = next.flatMap((section) => section.questions.map((question) => ({ id: question.id, section: section.name })));

        router.patch(
            route('admin.kuesioner.pertanyaan.urutan', kuesionerId),
            { items },
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={() => {
                snapshot.current = signature(sections);
            }}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setSections((previous) => previous)}
        >
            <div className="flex flex-col gap-4">
                {sections.map((section, sectionIndex) => (
                    <SectionBlock
                        key={section.name}
                        section={section}
                        startNumber={sections.slice(0, sectionIndex).reduce((total, item) => total + item.questions.length, 0) + 1}
                        selectedId={selectedId}
                        dragDisabled={isLocked}
                        onSelect={onSelect}
                        onAddQuestion={onAddQuestion}
                        onRename={onRenameSection}
                        onRemove={onRemoveSection}
                        renderQuestionPanel={renderQuestionPanel}
                        renderNewPanel={renderNewPanel}
                    />
                ))}
            </div>
        </DndContext>
    );
}
