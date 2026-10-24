import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CalendarClock, CheckCircle2, ClipboardCheck, ListChecks, PencilLine, CircleDashed } from 'lucide-react';
import AlumniLayout from '@/Layouts/AlumniLayout';
import { Badge, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, EmptyState, PageHeader } from '@/Components/ui';
import { formatShortDate } from '@/Components/berita/beritaMeta';

const RESPON_BADGES = {
    submitted: { label: 'Terkirim', variant: 'success', icon: CheckCircle2 },
    draft: { label: 'Draf', variant: 'warning', icon: PencilLine },
    none: { label: 'Belum mulai', variant: 'neutral', icon: CircleDashed },
};

function KuesionerItem({ item }) {
    const badge = RESPON_BADGES[item.respon_status ?? 'none'];
    const deadline = formatShortDate(item.end_date);

    return (
        <Card>
            <CardHeader>
                <Badge variant={badge.variant} icon={badge.icon} className="self-start">
                    {badge.label}
                </Badge>
                <h2 className="text-lg font-semibold leading-snug tracking-tight text-foreground">{item.title}</h2>
                {item.description && <CardDescription className="max-w-prose">{item.description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    {deadline && (
                        <li className="inline-flex items-center gap-1.5">
                            <CalendarClock aria-hidden="true" className="size-4" />
                            Ditutup {deadline}
                        </li>
                    )}
                    <li className="inline-flex items-center gap-1.5">
                        <ListChecks aria-hidden="true" className="size-4" />
                        <span className="tabular-nums">{item.pertanyaan_count}</span> pertanyaan
                    </li>
                </ul>
            </CardContent>
            <CardFooter>
                <Button asChild size="lg" variant={item.respon_status === 'submitted' ? 'outline' : 'default'} className="w-full sm:w-auto">
                    <Link href={route('alumni.kuesioner.show', item.id)}>
                        {item.action} Kuesioner
                        <ArrowRight aria-hidden="true" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function Index({ kuesionerList }) {
    return (
        <AlumniLayout>
            <Head title="Kuesioner" />

            <div className="mx-auto max-w-3xl space-y-6">
                <PageHeader
                    title="Kuesioner"
                    description="Jawaban Anda membantu madrasah memahami perjalanan alumni dan memperbaiki pendidikan."
                />

                {kuesionerList.length > 0 ? (
                    <div className="space-y-4">
                        {kuesionerList.map((item) => (
                            <KuesionerItem key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <Card>
                        <EmptyState
                            icon={ClipboardCheck}
                            title="Belum ada kuesioner untuk Anda"
                            description="Kami akan memberi kabar ketika periode tracer study untuk angkatan Anda dibuka."
                        />
                    </Card>
                )}
            </div>
        </AlumniLayout>
    );
}
