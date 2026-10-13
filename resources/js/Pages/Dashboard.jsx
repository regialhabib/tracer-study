import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import {
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    ArrowRight,
    GraduationCap,
    User,
    Briefcase,
    Phone,
    MapPin,
    Building2,
    BookOpen,
    ChevronRight,
    Newspaper,
    Check,
} from 'lucide-react';

export default function Dashboard({ activeKuesioner, hasFilled, beritaList = [] }) {
    const { auth } = usePage().props;
    const user = auth?.user || {};
    const profile = user?.profile || {};

    const statusLabels = {
        pengabdian: 'Khidmah / Pengabdian di Pesantren',
        kuliah_islam: 'Kuliah Studi Islam / Luar Negeri',
        kuliah_umum: 'Kuliah di PTN / PTS',
        bekerja: 'Bekerja Profesional / Industri',
        wirausaha: 'Wirausaha / Bisnis Mandiri',
        mencari_kerja: 'Mencari Kerja / Persiapan Studi',
        lainnya: 'Lainnya',
    };

    const getFirstName = (name) => {
        if (!name) return 'Alumni';
        return name.split(' ')[0];
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard Alumni - PP RIYADHUL AMIEN" />

            <div className="py-6 sm:py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Welcome Banner Card */}
                    <div className="rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
                        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                        <div className="absolute right-1/3 -top-12 w-48 h-48 rounded-full bg-teal-400/10 blur-xl pointer-events-none" />

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
                            <div className="space-y-3 max-w-3xl">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white shadow-sm">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-200" />
                                        Alumni Terverifikasi
                                    </span>
                                    {profile?.graduation_year && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/30 backdrop-blur-md px-3 py-1 text-xs font-medium text-emerald-100 border border-white/15">
                                            <GraduationCap className="h-3.5 w-3.5 text-emerald-300" />
                                            Angkatan {profile.graduation_year}
                                        </span>
                                    )}
                                    {user?.nisn && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/30 backdrop-blur-md px-3 py-1 text-xs font-mono text-emerald-100 border border-white/15">
                                            NISN {user.nisn}
                                        </span>
                                    )}
                                    {profile?.tahfidz_count > 0 && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/25 backdrop-blur-md px-3 py-1 text-xs font-medium text-amber-200">
                                            Tahfidz: {profile.tahfidz_count} Juz
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                                        Ahlan wa Sahlan, {getFirstName(user?.name)}!
                                    </h2>
                                    <p className="text-emerald-50 text-xs sm:text-sm mt-1.5 leading-relaxed max-w-2xl">
                                        Senang melihat Anda kembali. Rekam jejak studi dan karir Anda merupakan inspirasi bagi adik-adik santri serta landasan evaluasi mutu madrasah kita.
                                    </p>
                                </div>

                                <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/15 px-3 py-1 text-emerald-100">
                                        <BookOpen className="h-3.5 w-3.5 text-emerald-300" />
                                        {profile?.major || 'Madrasah Aliyah'}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/15 px-3 py-1 text-emerald-100">
                                        <Building2 className="h-3.5 w-3.5 text-emerald-300" />
                                        {profile?.pesantren_program || 'Program Reguler'}
                                    </span>
                                    {profile?.dormitory_complex && (
                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/15 px-3 py-1 text-emerald-100">
                                            <MapPin className="h-3.5 w-3.5 text-emerald-300" />
                                            Kompleks {profile.dormitory_complex}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="shrink-0 flex sm:flex-col items-start sm:items-end justify-between border-t lg:border-t-0 pt-4 lg:pt-0 border-white/20">
                                <div className="text-left sm:text-right">
                                    <span className="text-[11px] font-medium text-emerald-200 uppercase tracking-wider block">
                                        ID Registrasi
                                    </span>
                                    <span className="font-mono font-bold text-base text-white tracking-wide">
                                        MA-{profile?.graduation_year || '2026'}-{user?.id ? String(user.id).padStart(4, '0') : '0001'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active Tracer Instrument Card */}
                    {activeKuesioner ? (
                        <div
                            className={`rounded-2xl border p-6 sm:p-7 transition-all ${
                                hasFilled
                                    ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/60 via-white to-white dark:border-emerald-900/60 dark:from-emerald-950/20 dark:to-card'
                                    : 'border-amber-200 bg-gradient-to-br from-amber-50/70 via-white to-white dark:border-amber-900/60 dark:from-amber-950/20 dark:to-card'
                            }`}
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant={hasFilled ? 'emerald' : 'rubric'} className="gap-1.5 py-1 px-3">
                                            {hasFilled ? (
                                                <>
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                                    Telah Diisi & Tersimpan
                                                </>
                                            ) : (
                                                <>
                                                    <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                                    Wajib Diisi Alumni
                                                </>
                                            )}
                                        </Badge>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            Batas Akhir: {activeKuesioner.end_date ? new Date(activeKuesioner.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Tidak ada batas'}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                                            {activeKuesioner.title}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
                                            {activeKuesioner.description ||
                                                'Survei pelacakan masa tunggu kerja, linieritas studi, dan sebaran karir alumni santri untuk akreditasi & pengembangan madrasah.'}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                                        <span className="inline-flex items-center gap-1 font-medium">
                                            <FileText className="h-3.5 w-3.5 text-slate-400" />
                                            {activeKuesioner.pertanyaan_count} Butir Pertanyaan
                                        </span>
                                        <span>&bull;</span>
                                        <span>Estimasi ~5 Menit</span>
                                        <span>&bull;</span>
                                        <span>Target Angkatan: {profile?.graduation_year || activeKuesioner.year || 'Semua'}</span>
                                    </div>
                                </div>

                                <div className="shrink-0 flex items-center">
                                    {hasFilled ? (
                                        <Button
                                            disabled
                                            variant="outline"
                                            className="rounded-full gap-2 border-emerald-300 text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 font-semibold cursor-default"
                                        >
                                            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                            Kuesioner Sudah Selesai
                                        </Button>
                                    ) : (
                                        <Button
                                            size="lg"
                                            className="rounded-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold px-6 py-2.5 transition-all hover:shadow-md"
                                        >
                                            <FileText className="h-4 w-4" />
                                            Isi Kuesioner Sekarang <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-card p-8 text-center text-slate-500 shadow-sm space-y-2">
                            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                Tidak Ada Kuesioner Aktif
                            </h3>
                            <p className="text-xs text-slate-500 max-w-md mx-auto">
                                Saat ini belum ada periode kuesioner tracer study baru. Terima kasih telah selalu terhubung dengan madrasah!
                            </p>
                        </div>
                    )}

                    {/* Metrics Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-card p-5 shadow-sm space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Aktivitas Saat Ini
                                </span>
                                <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                    <Briefcase className="h-4 w-4" />
                                </div>
                            </div>
                            <div>
                                <div className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                                    {statusLabels[profile?.current_status] || profile?.current_status || 'Belum Diatur'}
                                </div>
                                <Link
                                    href={route('profile.edit')}
                                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 mt-1.5"
                                >
                                    Perbarui status <ChevronRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-card p-5 shadow-sm space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Progres Kuesioner
                                </span>
                                <div className="h-9 w-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                                    <FileText className="h-4 w-4" />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-bold text-slate-900 dark:text-white">
                                        {hasFilled ? '100% Selesai' : '0% Belum Mengisi'}
                                    </span>
                                    <span className="text-xs font-medium text-slate-400">
                                        {hasFilled ? 'Lengkap' : 'Menunggu'}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            hasFilled ? 'w-full bg-emerald-500' : 'w-0 bg-amber-500'
                                        }`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-card p-5 shadow-sm space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Kontak WhatsApp
                                </span>
                                <div className="h-9 w-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                    <Phone className="h-4 w-4" />
                                </div>
                            </div>
                            <div>
                                <div className="text-base font-mono font-bold text-slate-900 dark:text-white">
                                    {profile?.phone_number || 'Belum Ada'}
                                </div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                                    Untuk info karir & temu alumni
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Split Section: Biodata vs Kabar Madrasah */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Profile Summary Panel */}
                        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-card p-6 shadow-sm flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                            Profil Alumni
                                        </h3>
                                    </div>
                                    <Badge variant="outline" className="text-[10px]">
                                        DATA PRIBADI
                                    </Badge>
                                </div>

                                <div className="space-y-3 text-xs">
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Nama Lengkap</span>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{user?.name}</p>
                                    </div>
                                    <Separator />
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">NISN</span>
                                        <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                                            {user?.nisn || '-'}
                                        </p>
                                    </div>
                                    <Separator />
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Aktivitas Utama</span>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                                            {statusLabels[profile?.current_status] || '-'}
                                        </p>
                                    </div>
                                    <Separator />
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Kompleks Asrama</span>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                                            {profile?.dormitory_complex || '-'}
                                        </p>
                                    </div>
                                    <Separator />
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Nomor WhatsApp</span>
                                        <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                                            {profile?.phone_number || '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-5 border-t border-slate-100 dark:border-slate-800 mt-4">
                                <Button asChild variant="outline" size="sm" className="w-full rounded-xl text-xs font-semibold">
                                    <Link href={route('profile.edit')}>
                                        Perbarui Profil Alumni &rarr;
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Recent News & Announcements */}
                        <div className="lg:col-span-2 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-card p-6 shadow-sm flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-8 w-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                                            <Newspaper className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                                Kabar & Info Madrasah
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                Agenda temu alumni, peluang beasiswa, & pengumuman
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-xs font-medium">
                                            {beritaList.length} Terbaru
                                        </Badge>
                                        <Link
                                            href="/#berita"
                                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 hover:underline flex items-center gap-1 ml-1"
                                        >
                                            Semua Berita <ArrowRight className="h-3 w-3" />
                                        </Link>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {beritaList.length > 0 ? (
                                        beritaList.map((berita) => (
                                            <div
                                                key={berita.id}
                                                className="group flex flex-col sm:flex-row gap-4 rounded-xl border border-slate-100 dark:border-slate-800 p-3.5 sm:p-4 transition-all hover:bg-slate-50/80 dark:hover:bg-slate-800/40 hover:border-slate-200"
                                            >
                                                {berita.thumbnail && (
                                                    <Link href={route('berita.show', berita.slug)} className="shrink-0 w-full sm:w-36 h-36 sm:h-24 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 relative block">
                                                        <img
                                                            src={berita.thumbnail}
                                                            alt={berita.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            loading="lazy"
                                                        />
                                                    </Link>
                                                )}
                                                <div className="flex-1 flex flex-col justify-between min-w-0">
                                                    <div>
                                                        <div className="flex items-center justify-between gap-2">
                                                            <Badge
                                                                variant={
                                                                    berita.type === 'agenda' || berita.category === 'agenda'
                                                                        ? 'amber'
                                                                        : berita.type === 'pengumuman' || berita.category === 'pengumuman'
                                                                        ? 'blue'
                                                                        : 'emerald'
                                                                }
                                                                className="text-[10px] uppercase font-bold"
                                                            >
                                                                {berita.type || berita.category || 'BERITA'}
                                                            </Badge>
                                                            {berita.published_at && (
                                                                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {new Date(berita.published_at).toLocaleDateString('id-ID', {
                                                                        day: 'numeric',
                                                                        month: 'short',
                                                                        year: 'numeric',
                                                                    })}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <h4 className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">
                                                            <Link href={route('berita.show', berita.slug)} className="group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                                {berita.title}
                                                            </Link>
                                                        </h4>
                                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                            {berita.content}
                                                        </p>
                                                    </div>
                                                    <div className="mt-2 flex items-center justify-end">
                                                        <Link
                                                            href={route('berita.show', berita.slug)}
                                                            className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                                                        >
                                                            Baca Detail <ArrowRight className="h-3 w-3" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-xs text-slate-400">
                                            Belum ada pengumuman atau agenda terbaru dari madrasah.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
