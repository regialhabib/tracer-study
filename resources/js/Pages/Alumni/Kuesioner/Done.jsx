import { Head, Link } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import AlumniLayout from '@/Layouts/AlumniLayout';
import { Button, Card, CardContent } from '@/Components/ui';
import { formatShortDate } from '@/Components/berita/beritaMeta';

export default function Done({ kuesioner }) {
    return (
        <AlumniLayout>
            <Head title="Jawaban Terkirim" />

            <div className="mx-auto max-w-xl">
                <Card>
                    <CardContent className="flex flex-col items-center gap-4 py-10 text-center md:py-12">
                        <span className="flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
                            <CheckCircle2 aria-hidden="true" className="size-7" />
                        </span>
                        <div className="space-y-2">
                            <h1 className="text-xl font-semibold leading-snug tracking-tight text-foreground">
                                Jazakumullahu khairan
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Jawaban Anda untuk &ldquo;{kuesioner.title}&rdquo; sudah kami terima. Anda masih bisa merevisi jawaban
                                sampai {formatShortDate(kuesioner.end_date)}.
                            </p>
                        </div>
                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                            <Button asChild size="lg">
                                <Link href={route('dashboard')}>Kembali ke Beranda</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link href={route('alumni.kuesioner.show', kuesioner.id)}>Revisi Jawaban</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AlumniLayout>
    );
}
