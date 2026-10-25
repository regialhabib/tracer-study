import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BookOpenCheck, HeartHandshake, Newspaper, ShieldCheck } from 'lucide-react';
import { Button, Card, EmptyState } from '@/Components/ui';
import BeritaCard from '@/Components/berita/BeritaCard';
import PublicLayout from '@/Layouts/PublicLayout';

const tracerBenefits = [
    {
        icon: BookOpenCheck,
        title: 'Evaluasi kurikulum',
        description: 'Masukan Anda membantu madrasah menilai dan menyempurnakan pembelajaran bagi santri berikutnya.',
    },
    {
        icon: ShieldCheck,
        title: 'Bahan akreditasi',
        description: 'Data penelusuran alumni menjadi salah satu rujukan penting dalam akreditasi lembaga.',
    },
    {
        icon: HeartHandshake,
        title: 'Inspirasi adik kelas',
        description: 'Kisah studi, karier, dan khidmah Anda menjadi panduan nyata bagi para santri.',
    },
];

export default function Welcome({ auth, beritaTerbaru = [] }) {
    return (
        <PublicLayout>
            <Head title="Tracer Study - Pondok Pesantren RIYADHUL AMIEN" />

            {/* Hero */}
            <section className="border-b border-border bg-card">
                <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 py-6 sm:px-6 md:py-12 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-16">
                    <div className="flex flex-col gap-5">
                        <p className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                            <img src="/images/logo.webp" alt="" aria-hidden="true" className="size-4 object-contain" />
                            Tracer Study Alumni MA
                        </p>

                        <div className="flex flex-col gap-3">
                            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">
                                Merajut <span className="text-primary">Ukhuwah</span>, Mengawal Khidmah Santri
                            </h1>
                            <p className="max-w-prose text-base text-muted-foreground">
                                Bantu madrasah menelusuri kiprah alumni Pondok Pesantren Riyadhul Amien, mulai dari studi
                                lanjut, dunia kerja, wirausaha, hingga khidmah dakwah di tengah masyarakat.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            {auth?.user ? (
                                <Button asChild size="lg" className="w-full sm:w-auto">
                                    <Link href={route(auth.user.role === 'admin' ? 'admin.dashboard' : 'dashboard')}>
                                        Masuk ke Dasbor Saya
                                        <ArrowRight aria-hidden="true" />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button asChild size="lg" className="w-full sm:w-auto">
                                        <Link href={route('login')}>
                                            Masuk untuk Mengisi Kuesioner
                                            <ArrowRight aria-hidden="true" />
                                        </Link>
                                    </Button>
                                    <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                                        <Link href={route('register')}>Daftar</Link>
                                    </Button>
                                </>
                            )}
                        </div>

                        {!auth?.user && (
                            <p className="text-sm text-muted-foreground">
                                Belum punya akun? Daftar terlebih dahulu dengan NISN Anda.
                            </p>
                        )}
                    </div>

                    <div className="order-first lg:order-last">
                        <img
                            src="/images/hero/hero-pesantren.webp"
                            alt="Kompleks pondok pesantren saat matahari terbit"
                            width="1600"
                            height="1200"
                            fetchpriority="high"
                            className="aspect-video w-full rounded-xl bg-muted object-cover lg:aspect-[4/3]"
                        />
                    </div>
                </div>
            </section>

            {/* Manfaat tracer study */}
            <section id="manfaat" className="scroll-mt-20 py-12 md:py-16">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="flex max-w-2xl flex-col gap-2">
                        <h2 className="text-[22px] font-bold tracking-tight text-foreground md:text-2xl">
                            Mengapa partisipasi Anda berharga?
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Beberapa menit waktu Anda membantu madrasah membimbing generasi santri berikutnya.
                        </p>
                    </div>

                    <ul className="mt-8 grid gap-4 md:grid-cols-3 md:gap-6">
                        {tracerBenefits.map(({ icon: Icon, title, description }) => (
                            <li key={title}>
                                <Card className="flex h-full flex-col gap-3 p-5 md:p-6">
                                    <span
                                        aria-hidden="true"
                                        className="flex size-11 items-center justify-center rounded-lg bg-primary-soft text-primary"
                                    >
                                        <Icon className="size-5" />
                                    </span>
                                    <h3 className="text-base font-semibold text-foreground">{title}</h3>
                                    <p className="text-sm text-muted-foreground">{description}</p>
                                </Card>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Kabar terbaru */}
            <section id="berita" className="scroll-mt-20 border-t border-border bg-card py-12 md:py-16">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-[22px] font-bold tracking-tight text-foreground md:text-2xl">
                                Kabar &amp; Agenda Pesantren
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Informasi terbaru kegiatan madrasah, silaturahmi alumni, dan agenda pesantren.
                            </p>
                        </div>
                        {beritaTerbaru.length > 0 && (
                            <Button asChild variant="outline" className="hidden sm:inline-flex">
                                <Link href={route('berita.index')}>
                                    Lihat semua kabar
                                    <ArrowRight aria-hidden="true" />
                                </Link>
                            </Button>
                        )}
                    </div>

                    {beritaTerbaru.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
                                {beritaTerbaru.map((berita) => (
                                    <BeritaCard key={berita.id} berita={berita} />
                                ))}
                            </div>

                            <Button asChild variant="outline" className="mt-6 w-full sm:hidden">
                                <Link href={route('berita.index')}>
                                    Lihat semua kabar
                                    <ArrowRight aria-hidden="true" />
                                </Link>
                            </Button>
                        </>
                    ) : (
                        <Card>
                            <EmptyState
                                icon={Newspaper}
                                title="Belum ada kabar terbaru"
                                description="Berita dan agenda pesantren akan tampil di sini setelah diterbitkan."
                            />
                        </Card>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}
