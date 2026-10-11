import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Award,
    BookOpen,
    Building2,
    Calendar,
    CheckCircle2,
    ClipboardCheck,
    Clock,
    FileSpreadsheet,
    GraduationCap,
    HeartHandshake,
    MessageSquare,
    Newspaper,
    PlusCircle,
    TrendingUp,
    Users,
} from 'lucide-react';

export default function AdminDashboard({ stats, activeKuesioner, recentAlumni, statusBreakdown }) {
    const statusLabels = {
        pengabdian: { label: 'Khidmah / Pengabdian', color: 'bg-emerald-100 text-emerald-800' },
        kuliah_islam: { label: 'Kuliah Studi Islam / LN', color: 'bg-teal-100 text-teal-800' },
        kuliah_umum: { label: 'Kuliah Umum (PTN/PTS)', color: 'bg-blue-100 text-blue-800' },
        bekerja: { label: 'Bekerja Profesional', color: 'bg-indigo-100 text-indigo-800' },
        wirausaha: { label: 'Wirausaha / Santripreneur', color: 'bg-amber-100 text-amber-800' },
        mencari_kerja: { label: 'Mencari Kerja / Menunggu', color: 'bg-slate-100 text-slate-800' },
        lainnya: { label: 'Lainnya', color: 'bg-gray-100 text-gray-800' },
    };

    return (
        <AdminLayout header="Ringkasan Tracer Study MA">
            <Head title="Admin Dashboard - Tracer Study" />

            {/* Metric Stat Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">Total Santri Terdata</span>
                        <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                            <Users className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-slate-900">{stats.total_alumni}</div>
                    <p className="mt-1 text-[11px] text-slate-500">Alumni lulusan MA terdaftar</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">Tingkat Partisipasi</span>
                        <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-slate-900">{stats.response_rate}%</div>
                    <p className="mt-1 text-[11px] text-slate-500">
                        {stats.total_responses} santri telah mengisi kuesioner
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">Artikel & Agenda</span>
                        <div className="rounded-lg bg-indigo-50 p-2 text-indigo-700">
                            <Newspaper className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-slate-900">{stats.total_berita}</div>
                    <p className="mt-1 text-[11px] text-slate-500">Kabar pondok, event & beasiswa</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">Ruang Konsultasi</span>
                        <div className="rounded-lg bg-amber-50 p-2 text-amber-700">
                            <MessageSquare className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-slate-900">{stats.total_conversations}</div>
                    <p className="mt-1 text-[11px] text-slate-500">Obrolan langsung alumni & admin</p>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Active Questionnaire Banner */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-slate-900">Survei Tracer Study Aktif</h2>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" /> Berjalan
                        </span>
                    </div>

                    {activeKuesioner ? (
                        <div className="mt-4">
                            <h3 className="text-base font-semibold text-slate-900">
                                {activeKuesioner.title}
                            </h3>
                            <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                                {activeKuesioner.description}
                            </p>

                            <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-xs sm:grid-cols-3">
                                <div>
                                    <span className="text-slate-400">Total Butir:</span>
                                    <p className="font-semibold text-slate-800">
                                        {activeKuesioner.pertanyaan_count} Pertanyaan
                                    </p>
                                </div>
                                <div>
                                    <span className="text-slate-400">Target Angkatan:</span>
                                    <p className="font-semibold text-slate-800">
                                        {activeKuesioner.target_graduation_years?.join(', ') || 'Semua'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-slate-400">Batas Pengisian:</span>
                                    <p className="font-semibold text-slate-800">
                                        {activeKuesioner.end_date}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 rounded-lg bg-slate-50 p-4 text-center text-xs text-slate-500">
                            Belum ada periode survei yang sedang aktif.
                        </div>
                    )}

                    {/* Quick Action Buttons */}
                    <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 transition"
                        >
                            <PlusCircle className="h-3.5 w-3.5" />
                            Buat Kuesioner Baru
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                            Import Data Alumni
                        </button>
                    </div>
                </div>

                {/* Status Distribution Breakdown */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-900">Persebaran Status Alumni</h2>
                    <p className="mt-0.5 text-xs text-slate-500">Berdasarkan data profil santri</p>

                    <div className="mt-4 space-y-2.5">
                        {Object.entries(statusLabels).map(([key, config]) => {
                            const count = statusBreakdown[key] || 0;
                            return (
                                <div key={key} className="flex items-center justify-between text-xs">
                                    <span className={`rounded-md px-2 py-0.5 font-medium ${config.color}`}>
                                        {config.label}
                                    </span>
                                    <span className="font-bold text-slate-800">{count} santri</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Recent Registered Alumni Table */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 p-5">
                    <h2 className="text-sm font-bold text-slate-900">Daftar Santri Terdaftar Terbaru</h2>
                    <p className="mt-0.5 text-xs text-slate-500">Santri alumni yang baru saja didata atau mendaftar</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-5 py-3">Nama Santri</th>
                                <th className="px-5 py-3">NISN / Stambuk</th>
                                <th className="px-5 py-3">Peminatan MA</th>
                                <th className="px-5 py-3">Tahun Lulus</th>
                                <th className="px-5 py-3">Capaian Tahfidz</th>
                                <th className="px-5 py-3">Status Saat Ini</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentAlumni?.map((alumni) => {
                                const statusCfg = statusLabels[alumni.profile?.current_status] || {
                                    label: alumni.profile?.current_status || '-',
                                    color: 'bg-slate-100 text-slate-800',
                                };
                                return (
                                    <tr key={alumni.id} className="hover:bg-slate-50/70">
                                        <td className="px-5 py-3.5 font-semibold text-slate-900">
                                            {alumni.name}
                                        </td>
                                        <td className="px-5 py-3.5 font-mono text-slate-600">
                                            {alumni.nisn || alumni.profile?.stambuk_number || '-'}
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-700">
                                            {alumni.profile?.major || '-'}
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-700">
                                            {alumni.profile?.graduation_year || '-'}
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-700">
                                            {alumni.profile?.tahfidz_count ? (
                                                <span className="font-semibold text-emerald-700">
                                                    {alumni.profile.tahfidz_count} Juz
                                                </span>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${statusCfg.color}`}>
                                                {statusCfg.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
