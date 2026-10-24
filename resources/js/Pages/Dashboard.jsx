import AlumniLayout from '@/Layouts/AlumniLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, CalendarClock, CheckCircle2, CircleAlert, ClipboardCheck, Clock, ListChecks, Newspaper } from 'lucide-react';
import { Badge, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, EmptyState, PageHeader } from '@/Components/ui';
import BeritaCover from '@/Components/berita/BeritaCover';
import BeritaTypeBadge from '@/Components/berita/BeritaTypeBadge';
import { formatShortDate } from '@/Components/berita/beritaMeta';

/** Label status kegiatan alumni (`alumni_profiles.current_status`), urutan mengikuti DESIGN.md §2.3. */
const CURRENT_STATUS_LABELS = {
    pengabdian: 'Pengabdian/Khidmah',
    kuliah_islam: 'Kuliah Keislaman',
    kuliah_umum: 'Kuliah Umum',
    bekerja: 'Bekerja',
    wirausaha: 'Wirausaha',
    mencari_kerja: 'Mencari Kerja',
    lainnya: 'Lainnya',
};

const KUESIONER_ROUTE = 'alumni.kuesioner.index';

const sectionTitleClasses = 'text-lg font-semibold leading-snug tracking-tight text-foreground';

function firstNameOf(name) {
    return name?.trim().split(/\s+/)[0] || 'Alumni';
}

/** Perkiraan waktu pengisian: ± 30 detik per butir pertanyaan, minimal 1 menit. */
function estimateMinutes(questionCount) {
    return Math.max(1, Math.ceil(questionCount / 2));
}

function KuesionerCard({ kuesioner, hasFilled }) {
    const deadline = formatShortDate(kuesioner.end_date);
    const questionCount = Number(kuesioner.pertanyaan_count) || 0;
    const isKuesionerAvailable = route().has(KUESIONER_ROUTE);

    return (
        <Card>
            <CardHeader>
                {hasFilled ? (
                    <Badge variant="success" icon={CheckCircle2} className="self-start">
                        Selesai
                    </Badge>
                ) : (
                    <Badge variant="warning" icon={CircleAlert} className="self-start">
                        Wajib diisi
                    </Badge>
                )}
                <h2 className={sectionTitleClasses}>{kuesioner.title}</h2>
                {kuesioner.description && (
                    <CardDescription className="max-w-prose">{kuesioner.description}</CardDescription>
                )}
            </CardHeader>

            <CardContent>
                <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    {deadline && (
                        <li className="inline-flex items-center gap-1.5">
                            <CalendarClock aria-hidden="true" className="size-4" />
                            Ditutup {deadline}
                        </li>
                    )}
                    {questionCount > 0 && (
                        <>
                            <li className="inline-flex items-center gap-1.5">
                                <ListChecks aria-hidden="true" className="size-4" />
                                <span className="tabular-nums">{questionCount}</span> pertanyaan
                            </li>
                            <li className="inline-flex items-center gap-1.5">
                                <Clock aria-hidden="true" className="size-4" />
                                ± <span className="tabular-nums">{estimateMinutes(questionCount)}</span> menit
                            </li>
                        </>
                    )}
                </ul>
            </CardContent>

            <CardFooter className="flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                {hasFilled ? (
                    <p className="text-sm text-muted-foreground">
                        Jazakumullahu khairan, jawaban Anda sudah kami terima.
                    </p>
                ) : isKuesionerAvailable ? (
                    <Button asChild size="lg" className="w-full sm:w-auto">
                        <Link href={route(KUESIONER_ROUTE)}>
                            Isi Kuesioner
                            <ArrowRight aria-hidden="true" />
                        </Link>
                    </Button>
                ) : (
                    <>
                        <Button size="lg" disabled aria-describedby="kuesioner-hint" className="w-full sm:w-auto">
                            Isi Kuesioner
                        </Button>
                        <p id="kuesioner-hint" className="text-xs text-muted-foreground">
                            Pengisian dibuka pada pembaruan berikutnya.
                        </p>
                    </>
                )}
            </CardFooter>
        </Card>
    );
}

function ProfileSummaryCard({ user }) {
    const profile = user?.profile ?? {};
    const notFilled = 'Belum diisi';

    const rows = [
        { label: 'Angkatan', value: profile.graduation_year },
        { label: 'Peminatan', value: profile.major },
        { label: 'Status kegiatan', value: CURRENT_STATUS_LABELS[profile.current_status] ?? profile.current_status },
    ];

    return (
        <Card>
            <CardHeader className="pb-4 md:pb-4">
                <h2 className={sectionTitleClasses}>Profil Anda</h2>
                {user?.name && <CardDescription className="truncate">{user.name}</CardDescription>}
            </CardHeader>

            <CardContent>
                <dl className="divide-y divide-border border-y border-border text-sm">
                    {rows.map((row) => (
                        <div key={row.label} className="flex items-center justify-between gap-4 py-3">
                            <dt className="text-muted-foreground">{row.label}</dt>
                            <dd className={row.value ? 'text-right font-semibold text-foreground' : 'text-right text-muted-foreground'}>
                                {row.value || notFilled}
                            </dd>
                        </div>
                    ))}
                </dl>
            </CardContent>

            <CardFooter>
                <Button asChild variant="outline" className="w-full">
                    <Link href={route('profile.edit')}>Perbarui Profil</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

function BeritaListItem({ berita }) {
    const publishedDate = formatShortDate(berita.published_at);

    return (
        <li className="group relative flex gap-3 py-4 first:pt-0 last:pb-0 sm:gap-4">
            <BeritaCover
                src={berita.thumbnail}
                alt=""
                type={berita.type}
                className="w-28 shrink-0 rounded-md sm:w-36"
            />

            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <BeritaTypeBadge type={berita.type} />
                    {publishedDate && (
                        <time dateTime={berita.published_at} className="text-xs font-medium text-muted-foreground">
                            {publishedDate}
                        </time>
                    )}
                </div>
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground sm:text-base">
                    <Link
                        href={route('berita.show', berita.slug)}
                        className="rounded-sm transition-colors duration-150 ease-out after:absolute after:inset-0 group-hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        {berita.title}
                    </Link>
                </h3>
            </div>
        </li>
    );
}

function BeritaTerbaruCard({ beritaList }) {
    const allBeritaHref = route().has('berita.index') ? route('berita.index') : '/#berita';

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between gap-4">
                <h2 className={sectionTitleClasses}>Kabar Terbaru</h2>
                {beritaList.length > 0 && (
                    <Button asChild variant="link" size="sm">
                        <Link href={allBeritaHref}>Lihat semua</Link>
                    </Button>
                )}
            </CardHeader>

            <CardContent>
                {beritaList.length > 0 ? (
                    <ul className="divide-y divide-border">
                        {beritaList.map((berita) => (
                            <BeritaListItem key={berita.id} berita={berita} />
                        ))}
                    </ul>
                ) : (
                    <EmptyState
                        icon={Newspaper}
                        title="Belum ada kabar"
                        description="Kabar, agenda, dan pengumuman madrasah akan tampil di sini."
                        className="py-6"
                    />
                )}
            </CardContent>
        </Card>
    );
}

export default function Dashboard({ activeKuesioner, hasFilled, beritaList = [] }) {
    const user = usePage().props.auth?.user;

    return (
        <AlumniLayout>
            <Head title="Beranda" />

            <div className="space-y-6">
                <PageHeader
                    title={`Assalamu'alaikum, ${firstNameOf(user?.name)}`}
                    description="Terima kasih telah meluangkan waktu untuk madrasah. Berikut ringkasan tracer study Anda."
                />

                <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
                    <section aria-label="Kuesioner aktif" className="lg:col-span-2">
                        {activeKuesioner ? (
                            <KuesionerCard kuesioner={activeKuesioner} hasFilled={hasFilled} />
                        ) : (
                            <Card>
                                <EmptyState
                                    icon={ClipboardCheck}
                                    title="Belum ada kuesioner aktif"
                                    description="Kami akan memberi kabar ketika periode tracer study berikutnya dibuka."
                                />
                            </Card>
                        )}
                    </section>

                    <aside aria-label="Ringkasan profil" className="lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:self-start">
                        <ProfileSummaryCard user={user} />
                    </aside>

                    <section aria-label="Kabar terbaru" className="lg:col-span-2">
                        <BeritaTerbaruCard beritaList={beritaList} />
                    </section>
                </div>
            </div>
        </AlumniLayout>
    );
}
