import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
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
} from 'lucide-react';

export default function Dashboard({ activeKuesioner, hasFilled, beritaList }) {
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
                <h2 className="text-lg font-bold leading-tight text-gray-900">
                    Beranda Alumni Santri
                </h2>
            }
        >
            <Head title="Beranda Alumni - Tracer Study" />

            <div className="py-6 sm:py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Welcome Banner Card */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-6 text-white shadow-md sm:p-8">
                        <div className="relative z-10 max-w-2xl">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-900/50 px-3 py-1 text-xs font-medium text-emerald-200">
                                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                                Alumni MA & Pondok Pesantren
                            </span>
                            <h1 className="mt-2 text-xl font-extrabold tracking-tight sm:text-2xl">
                                Ahlan wa Sahlan, {user?.name}!
                            </h1>
                            <p className="mt-1 text-xs text-emerald-100 sm:text-sm">
                                Tetap terhubung dengan almamater tercinta. Kontribusi data Anda sangat berharga bagi evaluasi kurikulum dan kemajuan madrasah ke depan.
                            </p>

                            <div className="mt-5 flex flex-wrap gap-2 text-xs">
                                <span className="rounded-lg bg-white/10 px-3 py-1 font-mono font-medium backdrop-blur">
                                    NISN: {user?.nisn || '-'}
                                </span>
                                <span className="rounded-lg bg-white/10 px-3 py-1 font-medium backdrop-blur">
                                    Jurusan: {profile?.major || '-'}
                                </span>
                                <span className="rounded-lg bg-white/10 px-3 py-1 font-medium backdrop-blur">
                                    Lulus: {profile?.graduation_year || '-'}
                                </span>
                                {profile?.tahfidz_count > 0 && (
                                    <span className="rounded-lg bg-amber-400/20 text-amber-200 px-3 py-1 font-medium backdrop-blur">
                                        Tahfidz: {profile.tahfidz_count} Juz
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Background Ornament Icon */}
                        <GraduationCap className="absolute -bottom-8 -right-8 h-48 w-48 text-white/5 pointer-events-none" />
                    </div>

                    {/* Tracer Study Survey Status Card */}
                    {activeKuesioner && (
                        <div className={`rounded-xl border p-6 shadow-sm transition ${
                            hasFilled
                                ? 'border-emerald-200 bg-emerald-50/50'
                                : 'border-amber-200 bg-amber-50/60'
                        }`}>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2 rounded-lg ${hasFilled ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            <ClipboardList className="h-5 w-5" />
                                        </div>
                                        <h3 className="text-base font-bold text-gray-900">
                                            {activeKuesioner.title}
                                        </h3>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-600 max-w-2xl">
                                        {activeKuesioner.description}
                                    </p>
                                    <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3.5 w-3.5" />
                                            Batas: {activeKuesioner.end_date}
                                        </span>
                                        <span>&bull;</span>
                                        <span>{activeKuesioner.pertanyaan_count} Pertanyaan</span>
                                    </div>
                                </div>

                                <div className="sm:shrink-0">
                                    {hasFilled ? (
                                        <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-semibold text-white shadow-sm">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                                            Sudah Mengisi Kuesioner
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition"
                                        >
                                            <ClipboardList className="h-4 w-4" />
                                            Isi Kuesioner Sekarang
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Status Profil & Berita Grid */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Profile Summary Card */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900">Biodata Santri</h3>
                            <p className="mt-0.5 text-xs text-gray-500">Status riwayat Anda saat ini</p>

                            <div className="mt-4 space-y-3 text-xs">
                                <div>
                                    <span className="text-gray-400">Status Aktivitas:</span>
                                    <p className="font-semibold text-gray-800">
                                        {statusLabels[profile?.current_status] || profile?.current_status || '-'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-400">Program Pesantren:</span>
                                    <p className="font-semibold text-gray-800">
                                        {profile?.pesantren_program || '-'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-400">Asrama / Kompleks:</span>
                                    <p className="font-semibold text-gray-800">
                                        {profile?.dormitory_complex || '-'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-400">Nomor WhatsApp:</span>
                                    <p className="font-semibold text-gray-800">
                                        {profile?.phone_number || '-'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-gray-100">
                                <Link
                                    href={route('profile.edit')}
                                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                                >
                                    Perbarui Profil &rarr;
                                </Link>
                            </div>
                        </div>

                        {/* Recent News & Announcements */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">Kabar & Agenda Pesantren</h3>
                                    <p className="mt-0.5 text-xs text-gray-500">Informasi reuni, beasiswa, dan pengumuman almamater</p>
                                </div>
                            </div>

                            <div className="space-y-3.5">
                                {beritaList?.map((berita) => (
                                    <div
                                        key={berita.id}
                                        className="rounded-lg border border-gray-100 p-3.5 hover:bg-slate-50 transition"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                                                {berita.type}
                                            </span>
                                            {berita.event_date && (
                                                <span className="flex items-center gap-1 text-[11px] text-gray-500">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(berita.event_date).toLocaleDateString('id-ID')}
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="mt-1.5 text-xs font-bold text-gray-900">
                                            {berita.title}
                                        </h4>
                                        <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                                            {berita.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
