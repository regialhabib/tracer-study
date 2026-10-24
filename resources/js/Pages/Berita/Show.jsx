import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, CalendarClock, Check, Clock, ExternalLink, MapPin, Share2, User } from 'lucide-react';
import { Button } from '@/Components/ui';
import BeritaCard from '@/Components/berita/BeritaCard';
import BeritaCover from '@/Components/berita/BeritaCover';
import BeritaTypeBadge from '@/Components/berita/BeritaTypeBadge';
import { formatLongDate, formatShortDate, formatTime } from '@/Components/berita/beritaMeta';
import BeritaLayout from '@/Components/berita/BeritaLayout';
import RichContent from '@/Components/berita/RichContent';

export default function Show({ berita, beritaTerkait = [] }) {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        if (typeof window === 'undefined' || !navigator.clipboard) {
            return;
        }

        navigator.clipboard.writeText(window.location.href).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    };

    const publishedAt = berita.published_at || berita.created_at;
    const publishedDate = formatShortDate(publishedAt);
    const eventDate = formatLongDate(berita.event_date);
    const eventTime = formatTime(berita.event_date);
    const hasAgendaDetails = berita.type === 'agenda' || berita.event_date || berita.location;

    return (
        <BeritaLayout>
            <Head title={`${berita.title} - Pondok Pesantren RIYADHUL AMIEN`} />

            <div className="py-6 md:py-12">
                <article className="mx-auto flex max-w-3xl flex-col gap-6 px-4 sm:px-6 md:gap-8 lg:px-8">
                    <Link
                        href="/"
                        className="inline-flex w-fit items-center gap-1.5 rounded-md text-sm font-semibold text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <ArrowLeft aria-hidden="true" className="size-4" />
                        Kembali ke Beranda
                    </Link>

                    <header className="flex flex-col gap-4">
                        <BeritaTypeBadge type={berita.type} className="w-fit" />

                        <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl">
                            {berita.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                                <User aria-hidden="true" className="size-4" />
                                Oleh {berita.author?.name || 'Sekretariat MA'}
                            </span>
                            {publishedDate && (
                                <span className="inline-flex items-center gap-1.5">
                                    <Calendar aria-hidden="true" className="size-4" />
                                    <time dateTime={publishedAt}>{publishedDate}</time>
                                </span>
                            )}
                        </div>
                    </header>

                    <BeritaCover
                        src={berita.thumbnail_src}
                        alt={berita.title}
                        type={berita.type}
                        loading="eager"
                        className="rounded-xl border border-border"
                    />

                    {hasAgendaDetails && (
                        <section
                            aria-labelledby="agenda-heading"
                            className="flex flex-col gap-4 rounded-lg border border-info/20 bg-info-soft p-4 md:p-6"
                        >
                            <h2 id="agenda-heading" className="flex items-center gap-2 text-base font-semibold text-foreground">
                                <CalendarClock aria-hidden="true" className="size-5 text-info" />
                                Detail Agenda
                            </h2>

                            {berita.event_date || berita.location ? (
                                <div className="grid gap-4 text-sm sm:grid-cols-2">
                                    {eventDate && (
                                        <div className="flex items-start gap-2.5">
                                            <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-info" />
                                            <div className="flex flex-col gap-0.5">
                                                <p className="text-xs font-medium text-muted-foreground">Waktu pelaksanaan</p>
                                                <p className="font-semibold text-foreground">{eventDate}</p>
                                                {eventTime && <p className="text-foreground">Pukul {eventTime} WIB</p>}
                                            </div>
                                        </div>
                                    )}

                                    {berita.location && (
                                        <div className="flex items-start gap-2.5">
                                            <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-info" />
                                            <div className="flex flex-col gap-0.5">
                                                <p className="text-xs font-medium text-muted-foreground">Lokasi</p>
                                                <p className="font-semibold text-foreground">{berita.location}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Jadwal dan lokasi agenda akan diumumkan kemudian.
                                </p>
                            )}

                            {berita.registration_link && (
                                <Button asChild className="w-full sm:w-fit">
                                    <a href={berita.registration_link} target="_blank" rel="noopener noreferrer">
                                        Buka Tautan Pendaftaran
                                        <ExternalLink aria-hidden="true" />
                                        <span className="sr-only">(membuka tab baru)</span>
                                    </a>
                                </Button>
                            )}
                        </section>
                    )}

                    <RichContent html={berita.content} />

                    <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <Button variant="outline" onClick={handleCopyLink} className="w-full sm:w-auto">
                            {copied ? (
                                <Check aria-hidden="true" className="text-success" />
                            ) : (
                                <Share2 aria-hidden="true" className="text-muted-foreground" />
                            )}
                            <span aria-live="polite">{copied ? 'Tautan berhasil disalin' : 'Salin Tautan Artikel'}</span>
                        </Button>

                        <Button asChild variant="link" className="self-center sm:self-auto">
                            <Link href={route('berita.index')}>Lihat semua kabar</Link>
                        </Button>
                    </div>
                </article>

                {beritaTerkait.length > 0 && (
                    <section aria-labelledby="related-heading" className="mx-auto mt-12 max-w-6xl px-4 sm:px-6 md:mt-16 lg:px-8">
                        <div className="border-t border-border pt-8 md:pt-12">
                            <h2 id="related-heading" className="text-lg font-semibold text-foreground">
                                Kabar &amp; Agenda Lainnya
                            </h2>

                            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
                                {beritaTerkait.map((item) => (
                                    <BeritaCard key={item.id} berita={item} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </BeritaLayout>
    );
}
