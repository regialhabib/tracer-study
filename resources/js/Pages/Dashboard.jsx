import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import {
    BookOpen,
    Calendar,
    CheckCircle2,
    ClipboardList,
    Clock,
    GraduationCap,
    HeartHandshake,
    MapPin,
    MessageSquare,
    Newspaper,
    Sparkles,
    ArrowRight,
    UserCheck,
    Phone,
    Home,
} from 'lucide-react';

export default function Dashboard({ activeKuesioner, hasFilled, beritaList = [] }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const profile = user?.profile;

    const statusLabels = {
        pengabdian: 'Khidmah / Pengabdian di Pesantren',
        kuliah_islam: 'Melanjutkan Studi Islam / Luar Negeri',
        kuliah_umum: 'Melanjutkan Kuliah Umum (PTN/PTS)',
        bekerja: 'Bekerja Profesional',
        wirausaha: 'Santripreneur / Wirausaha',
        mencari_kerja: 'Mencari Peluang / Persiapan Studi',
        lainnya: 'Lainnya',
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            Beranda Santri Alumni
                        </h2>
                        <p className="text-xs text-slate-500">
                            Portal terpadu pelacakan karir dan silaturahmi almamater
                        </p>
                    </div>
                    <Badge variant="emerald" className="self-start sm:self-auto py-1">
                        Tahun Lulus: {profile?.graduation_year || '-'}
                    </Badge>
                </div>
            }
        >
            <Head title="Beranda Alumni - Tracer Study" />

            <div className="py-6 sm:py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Welcome Banner Card */}
                    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 text-white shadow-xl shadow-emerald-950/20">
                        <CardContent className="p-6 sm:p-8 relative z-10">
                            <div className="max-w-2xl">
                                <Badge className="mb-3 bg-emerald-900/60 text-emerald-200 border-emerald-600/40 gap-1.5 px-3 py-1 text-xs">
                                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                                    Alumni Madrasah Aliyah & Pondok Pesantren
                                </Badge>
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                    Ahlan wa Sahlan, {user?.name}!
                                </h1>
                                <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                                    Terima kasih telah menjadi bagian dari keluarga besar almamater. Partisipasi Anda dalam mengisi instrumen kuesioner tracer study menjadi bekal utama pengembangan mutu madrasah.
                                </p>

                                <div className="mt-6 flex flex-wrap items-center gap-2">
                                    <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-transparent font-mono">
                                        NISN: {user?.nisn || '-'}
                                    </Badge>
                                    <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-transparent">
                                        Jurusan: {profile?.major || '-'}
                                    </Badge>
                                    {profile?.tahfidz_count > 0 && (
                                        <Badge className="bg-amber-400/20 text-amber-200 border-amber-400/30">
                                            Tahfidz: {profile.tahfidz_count} Juz
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardContent>

                        {/* Background Ornament */}
                        <GraduationCap className="absolute -bottom-8 -right-8 h-56 w-56 text-white/5 pointer-events-none" />
                    </Card>

                    {/* Tracer Study Survey Status Card */}
                    {activeKuesioner && (
                        <Card className={`border-2 ${
                            hasFilled
                                ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/20'
                                : 'border-amber-300 bg-amber-50/50 dark:border-amber-900/60 dark:bg-amber-950/20'
                        }`}>
                            <CardContent className="p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`p-2.5 rounded-xl ${
                                                hasFilled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                                            }`}>
                                                <ClipboardList className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <Badge variant={hasFilled ? 'emerald' : 'amber'} className="mb-1">
                                                    {hasFilled ? 'Sudah Selesai Mengisi' : 'Wajib Diisi'}
                                                </Badge>
                                                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                                    {activeKuesioner.title}
                                                </h3>
                                            </div>
                                        </div>

                                        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
                                            {activeKuesioner.description}
                                        </p>

                                        <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5" />
                                                Batas Akhir: {activeKuesioner.end_date}
                                            </span>
                                            <span>&bull;</span>
                                            <span>{activeKuesioner.pertanyaan_count} Butir Pertanyaan</span>
                                        </div>
                                    </div>

                                    <div className="sm:shrink-0">
                                        {hasFilled ? (
                                            <Button disabled className="gap-2 bg-emerald-700 text-white cursor-default">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                                                Kuesioner Tersimpan
                                            </Button>
                                        ) : (
                                            <Button className="gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-md shadow-amber-600/20">
                                                <ClipboardList className="h-4 w-4" />
                                                Isi Kuesioner Sekarang
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Status Profil & Berita Grid */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Profile Summary Card */}
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-bold">Biodata Santri</CardTitle>
                                    <Avatar className="h-7 w-7">
                                        <AvatarFallback className="bg-emerald-700 text-white text-xs">
                                            {user?.name?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <CardDescription className="text-xs">
                                    Ringkasan status terkini
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3.5 text-xs">
                                <div>
                                    <span className="text-slate-400 block text-[11px]">Aktivitas Utama:</span>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                                        {statusLabels[profile?.current_status] || profile?.current_status || '-'}
                                    </p>
                                </div>
                                <Separator />
                                <div>
                                    <span className="text-slate-400 block text-[11px]">Program Pesantren:</span>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                                        {profile?.pesantren_program || '-'}
                                    </p>
                                </div>
                                <Separator />
                                <div>
                                    <span className="text-slate-400 block text-[11px]">Asrama / Kompleks:</span>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                                        {profile?.dormitory_complex || '-'}
                                    </p>
                                </div>
                                <Separator />
                                <div>
                                    <span className="text-slate-400 block text-[11px]">Kontak WhatsApp:</span>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                                        {profile?.phone_number || '-'}
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-3 border-t border-slate-100 dark:border-slate-800">
                                <Button asChild variant="outline" size="sm" className="w-full text-xs">
                                    <Link href={route('profile.edit')}>
                                        Perbarui Profil Santri
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Recent News & Announcements */}
                        <Card className="lg:col-span-2">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-sm font-bold">Kabar & Agenda Pesantren</CardTitle>
                                        <CardDescription className="text-xs">
                                            Informasi kegiatan silaturahmi, beasiswa, dan pengumuman
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {beritaList.length} Kabar
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                {beritaList.length > 0 ? (
                                    beritaList.map((berita) => (
                                        <div
                                            key={berita.id}
                                            className="rounded-lg border border-slate-200/80 p-3.5 hover:bg-slate-50/80 transition-colors dark:border-slate-800 dark:hover:bg-slate-900/50"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <Badge
                                                    variant={berita.category === 'agenda' ? 'amber' : berita.category === 'pengumuman' ? 'blue' : 'emerald'}
                                                    className="text-[10px] uppercase font-bold"
                                                >
                                                    {berita.category || 'BERITA'}
                                                </Badge>
                                                {berita.published_at && (
                                                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(berita.published_at).toLocaleDateString('id-ID')}
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="mt-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                                                {berita.title}
                                            </h4>
                                            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                                                {berita.content}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-xs text-slate-500">
                                        Belum ada kabar terbaru dari madrasah.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
