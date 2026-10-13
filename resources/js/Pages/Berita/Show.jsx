import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/Components/ui/card';
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    Clock,
    MapPin,
    ExternalLink,
    Check,
    Share2,
    GraduationCap,
    Newspaper,
    User,
} from 'lucide-react';

export default function Show({ auth, berita, beritaTerkait = [] }) {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const categoryBadgeVariant = (type) => {
        switch (type) {
            case 'agenda':
                return 'amber';
            case 'pengumuman':
                return 'blue';
            case 'info_beasiswa':
                return 'emerald';
            default:
                return 'emerald';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatEventDateTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-600 selection:text-white dark:bg-slate-950 dark:text-slate-50 flex flex-col font-sans">
            <Head title={`${berita.title} - Pondok Pesantren RIYADHUL AMIEN`} />

            {/* Navigation Header */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
                <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
                        <img
                            src="/images/logo.webp"
                            alt="Logo Pondok Pesantren RIYADHUL AMIEN"
                            className="h-10 w-10 sm:h-11 sm:w-11 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
                        />
                        <div>
                            <span className="text-sm sm:text-base font-bold tracking-tight block leading-tight">
                                TRACER STUDY
                            </span>
                            <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block tracking-wider uppercase">
                                PP RIYADHUL AMIEN
                            </span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-2">
                        {auth?.user ? (
                            <Button asChild size="sm" className="gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm">
                                <Link href={route(auth.user.role === 'admin' ? 'admin.dashboard' : 'dashboard')}>
                                    Dashboard <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        ) : (
                            <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs sm:text-sm">
                                <Link href={route('login')}>
                                    Masuk Santri
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 py-8 sm:py-12">
                <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* Back Link */}
                    <div className="mb-6">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300 transition-colors"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Kembali ke Beranda
                        </Link>
                    </div>

                    <article className="space-y-6 sm:space-y-8">
                        {/* Article Header Metadata */}
                        <header className="space-y-4">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <Badge variant={categoryBadgeVariant(berita.type)} className="text-xs uppercase font-bold py-1 px-3">
                                    {(berita.type || 'berita').replace('_', ' ')}
                                </Badge>
                                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                                    {formatDate(berita.published_at || berita.created_at)}
                                </span>
                                <span className="text-xs text-slate-400">&bull;</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                    <User className="h-3.5 w-3.5 text-emerald-600" />
                                    Oleh {berita.author?.name || 'Sekretariat MA'}
                                </span>
                            </div>

                            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                                {berita.title}
                            </h1>
                        </header>

                        {/* Featured Thumbnail */}
                        {berita.thumbnail ? (
                            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 shadow-md border border-slate-200/80 dark:border-slate-800">
                                <img
                                    src={berita.thumbnail}
                                    alt={berita.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="relative aspect-[21/9] w-full bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl flex items-center justify-center text-emerald-600/40 border border-emerald-100 dark:border-emerald-900/40">
                                <Newspaper className="h-16 w-16" />
                            </div>
                        )}

                        {/* Special Agenda Box (If event_date or location exists) */}
                        {(berita.type === 'agenda' || berita.event_date || berita.location) && (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6 dark:border-amber-900/60 dark:bg-amber-950/30 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                                    <h2 className="text-sm sm:text-base font-bold text-amber-950 dark:text-amber-200">
                                        Detail Agenda Kegiatan
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                                    {berita.event_date && (
                                        <div className="flex items-start gap-2.5">
                                            <Calendar className="h-4 w-4 text-amber-700 dark:text-amber-400 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="block font-semibold text-slate-700 dark:text-slate-300">Waktu Pelaksanaan</span>
                                                <span className="text-slate-600 dark:text-slate-400">{formatEventDateTime(berita.event_date)} WIB</span>
                                            </div>
                                        </div>
                                    )}

                                    {berita.location && (
                                        <div className="flex items-start gap-2.5">
                                            <MapPin className="h-4 w-4 text-amber-700 dark:text-amber-400 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="block font-semibold text-slate-700 dark:text-slate-300">Lokasi / Tempat</span>
                                                <span className="text-slate-600 dark:text-slate-400">{berita.location}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {berita.registration_link && (
                                    <div className="pt-2">
                                        <Button asChild size="sm" className="bg-amber-700 hover:bg-amber-800 text-white gap-1.5 font-semibold shadow-xs">
                                            <a href={berita.registration_link} target="_blank" rel="noopener noreferrer">
                                                <span>Pendaftaran / Tautan Resmi</span>
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Article Text Content */}
                        <div className="prose prose-slate dark:prose-invert max-w-none pt-2">
                            <div className="text-slate-700 dark:text-slate-200 text-base sm:text-lg leading-relaxed sm:leading-8 whitespace-pre-line space-y-4">
                                {berita.content}
                            </div>
                        </div>

                        {/* Share & Actions Toolbar */}
                        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopyLink}
                                    className="gap-2 text-xs font-semibold"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-4 w-4 text-emerald-600" />
                                            <span>Tautan Berhasil Disalin!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Share2 className="h-4 w-4 text-slate-500" />
                                            <span>Salin Tautan Artikel</span>
                                        </>
                                    )}
                                </Button>
                            </div>

                            <Link
                                href="/"
                                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 flex items-center gap-1"
                            >
                                Lihat Berita Lainnya di Beranda <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </article>

                    {/* Related Articles Section */}
                    {beritaTerkait && beritaTerkait.length > 0 && (
                        <section className="mt-16 pt-12 border-t border-slate-200/80 dark:border-slate-800">
                            <div className="mb-6">
                                <Badge variant="emerald" className="mb-2">Rekomendasi</Badge>
                                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    Kabar & Agenda Lainnya
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {beritaTerkait.map((item) => (
                                    <Card key={item.id} className="flex flex-col justify-between overflow-hidden hover:shadow-md transition-shadow group">
                                        <Link href={route('berita.show', item.slug)} className="block">
                                            {item.thumbnail ? (
                                                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                                                    <img
                                                        src={item.thumbnail}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                        loading="lazy"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="relative aspect-[16/9] w-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600/40">
                                                    <Newspaper className="h-8 w-8" />
                                                </div>
                                            )}
                                        </Link>

                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant={categoryBadgeVariant(item.type)} className="text-[10px] uppercase font-bold">
                                                    {(item.type || 'berita').replace('_', ' ')}
                                                </Badge>
                                                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {item.published_at ? new Date(item.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                                </span>
                                            </div>
                                            <CardTitle className="text-sm font-bold line-clamp-2 leading-snug">
                                                <Link href={route('berita.show', item.slug)} className="group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                                                    {item.title}
                                                </Link>
                                            </CardTitle>
                                        </CardHeader>

                                        <CardFooter className="pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-auto pt-3">
                                            <Link
                                                href={route('berita.show', item.slug)}
                                                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                                            >
                                                Baca Selengkapnya <ArrowRight className="h-3 w-3" />
                                            </Link>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 mt-auto">
                <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
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
