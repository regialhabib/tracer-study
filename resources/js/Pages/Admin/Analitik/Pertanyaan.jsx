import { Head } from '@inertiajs/react';
import { ClipboardList } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState, PageHeader } from '@/Components/ui';
import QuestionRecapBody from '@/Components/admin/analitik/QuestionRecapBody';
import ExportActions from '@/Components/admin/analitik/ExportActions';
import FilterBar from '@/Components/admin/analitik/FilterBar';
import { formatNumber } from '@/lib/analitik';
import { QUESTION_TYPE_LABELS } from '@/lib/kuesioner';

/** Kelompokkan rekap per nama bagian, urut kemunculan pertama. */
function groupBySection(questions) {
    const groups = [];

    questions.forEach((recap) => {
        const name = recap.question.section || 'Umum';
        let group = groups.find((item) => item.name === name);

        if (!group) {
            group = { name, items: [] };
            groups.push(group);
        }

        group.items.push(recap);
    });

    return groups;
}

function QuestionCard({ recap, number }) {
    const { question } = recap;

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="neutral">{QUESTION_TYPE_LABELS[question.question_type] ?? question.question_type}</Badge>
                    <span className="text-xs tabular-nums text-muted-foreground">
                        {formatNumber(recap.answered_count)} menjawab
                    </span>
                </div>
                <CardTitle className="text-base">
                    <span className="tabular-nums">{number}. </span>
                    {question.question_text}
                </CardTitle>
                {question.help_text && <CardDescription>{question.help_text}</CardDescription>}
            </CardHeader>
            <CardContent>
                <QuestionRecapBody recap={recap} />
            </CardContent>
        </Card>
    );
}

export default function AnalitikPertanyaan({ filters, filterOptions, kuesioner, questions = [] }) {
    const hasKuesioner = Boolean(kuesioner);
    const groups = groupBySection(questions ?? []);
    let questionNumber = 0;

    return (
        <AdminLayout
            title="Rekap per Pertanyaan"
            header={
                <PageHeader
                    title="Rekap per Pertanyaan"
                    description={
                        hasKuesioner
                            ? kuesioner.title
                            : 'Rekap jawaban tiap pertanyaan akan tampil di sini.'
                    }
                    actions={<ExportActions filters={filters} current="pertanyaan" disabled={!hasKuesioner} />}
                />
            }
        >
            <Head title="Rekap per Pertanyaan" />

            {!hasKuesioner ? (
                <Card>
                    <EmptyState
                        icon={ClipboardList}
                        title="Belum ada kuesioner"
                        description="Buat dan aktifkan kuesioner agar rekap jawaban dapat ditampilkan."
                    />
                </Card>
            ) : (
                <div className="flex flex-col gap-4 md:gap-6">
                    <FilterBar routeName="admin.analitik.pertanyaan" filters={filters} filterOptions={filterOptions} />

                    {groups.length === 0 ? (
                        <Card>
                            <EmptyState
                                icon={ClipboardList}
                                title="Belum ada pertanyaan"
                                description="Kuesioner ini belum memiliki pertanyaan."
                            />
                        </Card>
                    ) : (
                        groups.map((group) => (
                            <section key={group.name} aria-label={group.name} className="flex flex-col gap-4">
                                <h2 className="text-lg font-semibold text-foreground">{group.name}</h2>
                                {group.items.map((recap) => {
                                    questionNumber += 1;

                                    return <QuestionCard key={recap.question.id} recap={recap} number={questionNumber} />;
                                })}
                            </section>
                        ))
                    )}
                </div>
            )}
        </AdminLayout>
    );
}
