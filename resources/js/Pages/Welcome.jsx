import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BookOpenCheck, ChevronLeft, ChevronRight, HeartHandshake, Newspaper, ShieldCheck } from 'lucide-react';
import { Button, Card, EmptyState } from '@/Components/ui';
import BeritaCard from '@/Components/berita/BeritaCard';
import PublicLayout from '@/Layouts/PublicLayout';
import { cn } from '@/lib/utils';

const BERITA_PER_PAGE = 3;

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

const pageButtonClasses =
    'inline-flex h-10 min-w-10 items-center justify-center rounded-md px-3 text-sm font-medium tabular-nums transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

export default function Welcome({ auth, beritaTerbaru = [] }) {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(beritaTerbaru.length / BERITA_PER_PAGE) || 1;
    const startIndex = (currentPage - 1) * BERITA_PER_PAGE;
    const displayedBerita = beritaTerbaru.slice(startIndex, startIndex + BERITA_PER_PAGE);
    const endIndex = Math.min(startIndex + BERITA_PER_PAGE, beritaTerbaru.length);

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    return (
        <PublicLayout
            navigation={[
                { label: 'Kabar & Berita', href: '#berita' },
                { label: 'Manfaat Tracer', href: '#manfaat' },
            ]}
        >
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

                    <ul className="mt-8 grid gap-6 md:grid-cols-3 md:gap-8">
                        {tracerBenefits.map(({ icon: Icon, title, description }) => (
                            <li key={title} className="flex flex-col gap-2 border-t border-border pt-5">
                                <Icon aria-hidden="true" className="size-5 text-primary" />
                                <h3 className="text-base font-semibold text-foreground">{title}</h3>
                                <p className="text-sm text-muted-foreground">{description}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Kabar terbaru */}
            <section id="berita" className="scroll-mt-20 border-t border-border bg-card py-12 md:py-16">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-[22px] font-bold tracking-tight text-foreground md:text-2xl">
                                Kabar &amp; Agenda Pesantren
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Informasi terbaru kegiatan madrasah, silaturahmi alumni, dan agenda pesantren.
                            </p>
                        </div>
                        {beritaTerbaru.length > 0 && (
                            <span className="text-xs font-medium tabular-nums text-muted-foreground">
                                {beritaTerbaru.length.toLocaleString('id-ID')} kabar diterbitkan
                            </span>
                        )}
                    </div>

                    {beritaTerbaru.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
                                {displayedBerita.map((berita) => (
                                    <BeritaCard key={berita.id} berita={berita} />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
                                    <p className="text-sm tabular-nums text-muted-foreground">
                                        Menampilkan{' '}
                                        <span className="font-semibold text-foreground">
                                            {startIndex + 1}–{endIndex}
                                        </span>{' '}
                                        dari <span className="font-semibold text-foreground">{beritaTerbaru.length}</span> kabar
                                    </p>

                                    <nav aria-label="Navigasi halaman kabar">
                                        <ul className="flex items-center gap-1">
                                            <li>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={handlePrevPage}
                                                    disabled={currentPage === 1}
                                                    aria-label="Halaman sebelumnya"
                                                >
                                                    <ChevronLeft aria-hidden="true" />
                                                </Button>
                                            </li>
                                            {Array.from({ length: totalPages }, (_, index) => {
                                                const pageNumber = index + 1;
                                                const isActive = currentPage === pageNumber;

                                                return (
                                                    <li key={pageNumber} className={isActive ? undefined : 'hidden sm:block'}>
                                                        <button
                                                            type="button"
                                                            onClick={() => setCurrentPage(pageNumber)}
                                                            aria-current={isActive ? 'page' : undefined}
                                                            className={cn(
                                                                pageButtonClasses,
                                                                isActive
                                                                    ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
                                                                    : 'text-foreground hover:bg-muted',
                                                            )}
                                                        >
                                                            {pageNumber}
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                            <li>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={handleNextPage}
                                                    disabled={currentPage === totalPages}
                                                    aria-label="Halaman berikutnya"
                                                >
                                                    <ChevronRight aria-hidden="true" />
                                                </Button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            )}
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
