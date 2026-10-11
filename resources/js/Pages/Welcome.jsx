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
    Sparkles,
    ShieldCheck,
    Building2,
    Compass,
    Newspaper,
    ChevronRight,
} from 'lucide-react';

export default function Welcome({ auth, beritaTerbaru = [] }) {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-600 selection:text-white dark:bg-slate-950 dark:text-slate-50">
            <Head title="Tracer Study MA & Pondok Pesantren" />

            {/* Navigation Header */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
                <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-md shadow-emerald-700/20">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="text-base font-bold tracking-tight block">
                                TRACER STUDY
                            </span>
                            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 block tracking-wider uppercase -mt-0.5">
                                MA Pondok Pesantren
                            </span>
                        </div>
                    </div>

                    <nav className="flex items-center gap-2">
                        {auth?.user ? (
                            <Button asChild className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white">
                                <Link href={route(auth.user.role === 'admin' ? 'admin.dashboard' : 'dashboard')}>
                                    Buka Dashboard <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild variant="ghost" size="sm">
                                    <Link href={route('login')}>Masuk</Link>
                                </Button>
                                <Button asChild size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white">
                                    <Link href={route('register')}>Daftar Mandiri</Link>
                                </Button>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32">
                {/* Background decorative glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-emerald-100/60 via-teal-50/20 to-transparent blur-3xl pointer-events-none -z-10 dark:from-emerald-950/30 dark:via-teal-950/10" />

                <div className="container mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300 mb-6">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                        Portal Resmi Penelusuran Alumni Madrasah Aliyah
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
            <section className="py-16">
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
                    </div>

                    {beritaTerbaru && beritaTerbaru.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {beritaTerbaru.map((berita) => (
                                <Card key={berita.id} className="flex flex-col justify-between overflow-hidden hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge variant={berita.category === 'agenda' ? 'amber' : berita.category === 'pengumuman' ? 'blue' : 'emerald'}>
                                                {berita.category.toUpperCase()}
                                            </Badge>
                                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {berita.published_at ? new Date(berita.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                            </span>
                                        </div>
                                        <CardTitle className="text-base line-clamp-2">
                                            {berita.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pb-4">
                                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
                                            {berita.content}
                                        </p>
                                    </CardContent>
                                    <CardFooter className="pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-auto pt-3">
                                        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                            Penulis: {berita.author?.name || 'Sekretariat MA'}
                                        </span>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
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
                    <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-emerald-700" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Tracer Study Madrasah Aliyah &bull; Pondok Pesantren
                        </span>
                    </div>
                    <p>
                        &copy; {new Date().getFullYear()} Yayasan Pondok Pesantren. Seluruh hak cipta dilindungi.
                    </p>
                </div>
            </footer>
        </div>
    );
}
