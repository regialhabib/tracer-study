import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import {
    GraduationCap,
    BookOpen,
    Users,
    Briefcase,
    Calendar,
    ArrowRight,
    ShieldCheck,
    Building2,
    Compass,
    Newspaper,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
} from 'lucide-react';

export default function Welcome({ auth, beritaTerbaru = [] }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;
    const totalPages = Math.ceil(beritaTerbaru.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const displayedBerita = beritaTerbaru.slice(startIndex, startIndex + itemsPerPage);

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
        <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-600 selection:text-white dark:bg-slate-950 dark:text-slate-50">
            <Head title="Tracer Study - Pondok Pesantren RIYADHUL AMIEN" />

            {/* Navigation Header */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
                <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
                        <img
                            src="/images/logo.webp"
                            alt="Logo Pondok Pesantren RIYADHUL AMIEN"
                            className="h-10 w-10 sm:h-11 sm:w-11 object-contain drop-shadow-sm group-hover:scale-105 transition-transform shrink-0"
                        />
                        <div className="min-w-0">
                            <span className="text-sm sm:text-base font-bold tracking-tight block leading-tight truncate">
                                TRACER STUDY
                            </span>
                            <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block tracking-wider uppercase truncate">
                                PP RIYADHUL AMIEN
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-4">
                        <a
                            href="#berita"
                            className="text-xs font-semibold text-slate-600 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400 transition"
                        >
                            Kabar & Berita
                        </a>
                        <a
                            href="#manfaat"
                            className="text-xs font-semibold text-slate-600 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400 transition"
                        >
                            Manfaat Tracer
                        </a>

                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

                        {auth?.user ? (
                            <Button asChild size="sm" className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm">
                                <Link href={route(auth.user.role === 'admin' ? 'admin.dashboard' : 'dashboard')}>
                                    Buka Dashboard <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild variant="ghost" size="sm">
                                    <Link href={route('login')}>Masuk</Link>
                                </Button>
                                <Button asChild size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs">
                                    <Link href={route('register')}>Daftar Mandiri</Link>
                                </Button>
                            </>
                        )}
                    </nav>

                    {/* Mobile Quick Action & Hamburger */}
                    <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
                        {auth?.user ? (
                            <Button asChild size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-8 px-2.5">
                                <Link href={route(auth.user.role === 'admin' ? 'admin.dashboard' : 'dashboard')}>
                                    Dashboard
                                </Link>
                            </Button>
                        ) : (
                            <Button asChild size="sm" variant="ghost" className="text-xs h-8 px-2.5 font-semibold text-emerald-800 dark:text-emerald-300">
                                <Link href={route('login')}>
                                    Masuk
                                </Link>
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="h-9 w-9 text-slate-600 hover:text-slate-900 dark:text-slate-400"
                            aria-label="Toggle Menu"
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Dropdown Menu Drawer */}
                {mobileMenuOpen && (
                    <div className="border-t border-b border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md md:hidden px-4 py-4 space-y-3 shadow-xl shadow-slate-900/10 animate-in slide-in-from-top-2 duration-200">
                        <div className="space-y-1">
                            <a
                                href="#berita"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            >
                                <Newspaper className="h-4 w-4 text-emerald-600" />
                                <span>Kabar & Berita Pesantren</span>
                            </a>
                            <a
                                href="#manfaat"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            >
                                <GraduationCap className="h-4 w-4 text-emerald-600" />
                                <span>Manfaat Partisipasi Tracer Study</span>
                            </a>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 space-y-2">
                            {auth?.user ? (
                                <Button asChild className="w-full justify-center bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-sm">
                                    <Link href={route(auth.user.role === 'admin' ? 'admin.dashboard' : 'dashboard')}>
                                        Buka Dashboard Saya <ArrowRight className="h-4 w-4 ml-1" />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button asChild className="w-full justify-center bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-sm">
                                        <Link href={route('register')}>
                                            Registrasi Mandiri Alumni
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" className="w-full justify-center font-semibold">
                                        <Link href={route('login')}>
                                            Masuk dengan NISN
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32">
                {/* Background decorative glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-emerald-100/60 via-teal-50/20 to-transparent blur-3xl pointer-events-none -z-10 dark:from-emerald-950/30 dark:via-teal-950/10" />

                <div className="container mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300 mb-6">
                        <img src="/images/logo.webp" alt="Logo" className="h-4 w-4 object-contain" />
                        Portal Resmi Penelusuran Alumni Pondok Pesantren RIYADHUL AMIEN
                    </div>

                    <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-slate-900 dark:text-slate-50 leading-tight">
                        Merajut <span className="text-emerald-700 dark:text-emerald-400">Ukhuwah</span>, Mengawal{' '}
                        <span className="text-emerald-700 dark:text-emerald-400">Khidmah Santri</span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-600 dark:text-slate-300">
                        Wadah pendataan rekam jejak kelulusan, studi lanjut ke perguruan tinggi ternama, kiprah dunia usaha, dan khidmah dakwah alumni Madrasah Aliyah di tengah masyarakat.
                    </p>

                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                        {auth?.user ? (
                            <Button asChild size="lg" className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg shadow-emerald-700/25">
                                <Link href={route(auth.user.role === 'admin' ? 'admin.dashboard' : 'dashboard')}>
                                    Masuk ke Dashboard Saya <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild size="lg" className="w-full sm:w-auto gap-2 bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg shadow-emerald-700/25">
                                    <Link href={route('login')}>
                                        Masuk Menggunakan NISN <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                                    <Link href={route('register')}>
                                        Registrasi Mandiri Alumni
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Core Metrics / Pillars Section */}
            <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800">
                <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <Badge variant="emerald" className="mb-2">Jejak Langkah Alumni</Badge>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                            Arah Perkembangan Karir Santri
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-2">
                            Membantu madrasah memetakan kualitas pembelajaran dan membimbing adik-adik santri
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
                            <CardHeader className="pb-3">
                                <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                                    <BookOpen className="h-5 w-5" />
                                </div>
                                <CardTitle className="text-base">Studi Lanjut</CardTitle>
                                <CardDescription className="text-xs">
                                    Kuliah di PTN, PTS, Ma'had Aly, hingga Perguruan Tinggi Luar Negeri & Timur Tengah.
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
                            <CardHeader className="pb-3">
                                <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
                                    <Briefcase className="h-5 w-5" />
                                </div>
                                <CardTitle className="text-base">Dunia Kerja</CardTitle>
                                <CardDescription className="text-xs">
                                    Bekerja profesional di instansi pemerintah, BUMN, perbankan, dan swasta.
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
                            <CardHeader className="pb-3">
                                <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
                                    <Compass className="h-5 w-5" />
                                </div>
                                <CardTitle className="text-base">Wirausaha</CardTitle>
                                <CardDescription className="text-xs">
                                    Membangun unit usaha mandiri, ekonomi kreatif, dan kemandirian pesantren.
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card className="border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
                            <CardHeader className="pb-3">
                                <div className="h-10 w-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center mb-2">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <CardTitle className="text-base">Khidmah Dakwah</CardTitle>
                                <CardDescription className="text-xs">
                                    Pengabdian di pesantren, membina madrasah diniyah, dan dakwah kemasyarakatan.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            </section>

            {/* News and Announcements Section */}
            <section id="berita" className="py-16">
                <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                        <div>
                            <Badge variant="emerald" className="mb-2">Kabar Terkini</Badge>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                                Berita & Agenda Pondok Pesantren
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                Informasi terbaru kegiatan madrasah, silaturahmi alumni, dan agenda akbar
                            </p>
                        </div>
                        {beritaTerbaru && beritaTerbaru.length > 0 && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                Total {beritaTerbaru.length} informasi diterbitkan
                            </span>
                        )}
                    </div>

                    {beritaTerbaru && beritaTerbaru.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {displayedBerita.map((berita) => (
                                    <Card key={berita.id} className="flex flex-col justify-between overflow-hidden hover:shadow-md transition-shadow group">
                                        <Link href={route('berita.show', berita.slug)} className="block">
                                            {berita.thumbnail ? (
                                                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                                                    <img
                                                        src={berita.thumbnail}
                                                        alt={berita.title}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                        loading="lazy"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="relative aspect-[16/9] w-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600/40">
                                                    <Newspaper className="h-10 w-10" />
                                                </div>
                                            )}
                                        </Link>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant={berita.category === 'agenda' || berita.type === 'agenda' ? 'amber' : berita.category === 'pengumuman' || berita.type === 'pengumuman' ? 'blue' : 'emerald'}>
                                                    {(berita.category || berita.type || 'berita').toUpperCase()}
                                                </Badge>
                                                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {berita.published_at ? new Date(berita.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                                </span>
                                            </div>
                                            <CardTitle className="text-base line-clamp-2">
                                                <Link href={route('berita.show', berita.slug)} className="group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                                                    {berita.title}
                                                </Link>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pb-4">
                                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
                                                {berita.content}
                                            </p>
                                        </CardContent>
                                        <CardFooter className="pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-auto pt-3 flex items-center justify-between">
                                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                                                {berita.author?.name || 'Sekretariat MA'}
                                            </span>
                                            <Link
                                                href={route('berita.show', berita.slug)}
                                                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                                            >
                                                Baca <ArrowRight className="h-3 w-3" />
                                            </Link>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 dark:border-slate-800 pt-6">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Menampilkan{' '}
                                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                                            {startIndex + 1}
                                        </span>{' '}
                                        -{' '}
                                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                                            {Math.min(startIndex + itemsPerPage, beritaTerbaru.length)}
                                        </span>{' '}
                                        dari{' '}
                                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                                            {beritaTerbaru.length}
                                        </span>{' '}
                                        berita & agenda
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handlePrevPage}
                                            disabled={currentPage === 1}
                                            className="gap-1 text-xs"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Sebelumnya
                                        </Button>

                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }).map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setCurrentPage(idx + 1)}
                                                    className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all ${
                                                        currentPage === idx + 1
                                                            ? 'bg-emerald-700 text-white shadow-sm'
                                                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                                    }`}
                                                >
                                                    {idx + 1}
                                                </button>
                                            ))}
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleNextPage}
                                            disabled={currentPage === totalPages}
                                            className="gap-1 text-xs"
                                        >
                                            Selanjutnya
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <Card className="text-center p-8 bg-white dark:bg-slate-900">
                            <Newspaper className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Belum ada berita atau agenda terbaru yang diterbitkan.
                            </p>
                        </Card>
                    )}
                </div>
            </section>

            {/* Why Tracer Study Section */}
            <section className="py-14 bg-emerald-800 text-white relative overflow-hidden">
                <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        Mengapa Partisipasi Anda Sangat Berharga?
                    </h2>
                    <p className="mt-3 text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto">
                        Data yang Anda isi di kuesioner tracer study menjadi rujukan evaluasi kurikulum madrasah, syarat akreditasi lembaga, dan panduan inspirasi bagi ribuan adik kelas santri.
                    </p>

                    <div className="mt-8">
                        <Button asChild size="lg" className="bg-white text-emerald-900 hover:bg-slate-100 font-semibold shadow-xl">
                            <Link href={auth?.user ? route('dashboard') : route('login')}>
                                Mulai Mengisi Tracer Study <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-2.5">
                        <img
                            src="/images/logo.webp"
                            alt="Logo Pondok Pesantren RIYADHUL AMIEN"
                            className="h-6 w-6 object-contain"
                        />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Tracer Study &bull; Pondok Pesantren RIYADHUL AMIEN
                        </span>
                    </div>
                    <p>
                        &copy; {new Date().getFullYear()} Pondok Pesantren RIYADHUL AMIEN. Seluruh hak cipta dilindungi.
                    </p>
                </div>
            </footer>
        </div>
    );
}
