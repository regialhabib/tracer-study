import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/Components/ui/table';
import { Separator } from '@/Components/ui/separator';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
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
    Sparkles,
} from 'lucide-react';

export default function AdminDashboard({ stats, activeKuesioner, recentAlumni = [], statusBreakdown = {} }) {
    const statusBadges = {
        pengabdian: { label: 'Khidmah Pesantren', variant: 'emerald' },
        kuliah_islam: { label: 'Studi Islam / LN', variant: 'emerald' },
        kuliah_umum: { label: 'Kuliah Umum PTN/PTS', variant: 'blue' },
        bekerja: { label: 'Bekerja Profesional', variant: 'secondary' },
        wirausaha: { label: 'Wirausaha / Mandiri', variant: 'amber' },
        mencari_kerja: { label: 'Persiapan Karir', variant: 'outline' },
        lainnya: { label: 'Lainnya', variant: 'outline' },
    };

    return (
        <AdminLayout header="Ringkasan Analitik Tracer Study">
            <Head title="Admin Dashboard - Tracer Study" />

            {/* 4 Metric Stat Cards with Shadcn Card */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-medium text-slate-500">Total Santri Terdata</CardTitle>
                        <div className="rounded-lg bg-emerald-100/70 p-2 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            <Users className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            {stats.total_alumni}
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">Alumni lulusan MA terdaftar</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-medium text-slate-500">Tingkat Partisipasi</CardTitle>
                        <div className="rounded-lg bg-blue-100/70 p-2 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            {stats.response_rate}%
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">
                            {stats.total_responses} santri telah mengisi kuesioner
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-medium text-slate-500">Artikel & Agenda</CardTitle>
                        <div className="rounded-lg bg-teal-100/70 p-2 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                            <Newspaper className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            {stats.total_berita}
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">Kabar pondok, event & beasiswa</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-medium text-slate-500">Ruang Konsultasi</CardTitle>
                        <div className="rounded-lg bg-amber-100/70 p-2 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            <MessageSquare className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            {stats.total_conversations}
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">Obrolan langsung alumni & admin</p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Active Questionnaire Banner */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold">Survei Tracer Study Aktif</CardTitle>
                                <CardDescription className="text-xs">
                                    Instrumen kuesioner evaluasi yang sedang dibuka untuk alumni
                                </CardDescription>
                            </div>
                            <Badge variant="emerald" className="gap-1 px-2.5 py-0.5">
                                <CheckCircle2 className="h-3 w-3" /> Berjalan
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {activeKuesioner ? (
                            <div className="rounded-lg border border-slate-200/80 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50 space-y-3">
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        {activeKuesioner.title}
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                        {activeKuesioner.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Total Butir:</span>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                                            {activeKuesioner.pertanyaan_count} Pertanyaan
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Target Angkatan:</span>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                                            {activeKuesioner.target_graduation_years?.join(', ') || 'Semua Lulusan'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Batas Pengisian:</span>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                                            {activeKuesioner.end_date}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500">
                                Belum ada kuesioner aktif yang diterbitkan.
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                        <Button size="sm" className="gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white">
                            <PlusCircle className="h-3.5 w-3.5" />
                            Buat Kuesioner Baru
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1.5">
                            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-700" />
                            Import Data Alumni
                        </Button>
                    </CardFooter>
                </Card>

                {/* Status Distribution Breakdown */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-bold">Persebaran Status Santri</CardTitle>
                        <CardDescription className="text-xs">
                            Aktivitas alumni setelah kelulusan
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        {Object.entries(statusBadges).map(([key, config]) => {
                            const count = statusBreakdown[key] || 0;
                            return (
                                <div key={key} className="flex items-center justify-between text-xs">
                                    <Badge variant={config.variant} className="font-medium">
                                        {config.label}
                                    </Badge>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">
                                        {count} santri
                                    </span>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Registered Alumni Table with Shadcn Table */}
            <Card className="mt-6">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-bold">Daftar Santri Terdaftar Terbaru</CardTitle>
                            <CardDescription className="text-xs">
                                Rekam data alumni yang baru saja mendaftar mandiri atau diinput
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-xs">
                            {recentAlumni.length} Data Terkini
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Santri</TableHead>
                                <TableHead>NISN / Stambuk</TableHead>
                                <TableHead>Peminatan MA</TableHead>
                                <TableHead>Tahun Lulus</TableHead>
                                <TableHead>Capaian Tahfidz</TableHead>
                                <TableHead>Status Terkini</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentAlumni && recentAlumni.length > 0 ? (
                                recentAlumni.map((alumni) => {
                                    const badgeCfg = statusBadges[alumni.profile?.current_status] || {
                                        label: alumni.profile?.current_status || '-',
                                        variant: 'outline',
                                    };
                                    return (
                                        <TableRow key={alumni.id}>
                                            <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                                                <div className="flex items-center gap-2.5">
                                                    <Avatar className="h-7 w-7">
                                                        <AvatarFallback className="text-[10px] bg-emerald-700 text-white font-bold">
                                                            {alumni.name?.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span>{alumni.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-400">
                                                {alumni.nisn || alumni.profile?.stambuk_number || '-'}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {alumni.profile?.major || '-'}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {alumni.profile?.graduation_year || '-'}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {alumni.profile?.tahfidz_count ? (
                                                    <Badge variant="emerald" className="font-semibold text-[11px]">
                                                        {alumni.profile.tahfidz_count} Juz
                                                    </Badge>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={badgeCfg.variant} className="text-[11px]">
                                                    {badgeCfg.label}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-6 text-slate-500">
                                        Belum ada data santri yang terdaftar.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
