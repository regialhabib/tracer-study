import { Head, Link } from '@inertiajs/react';
import { Newspaper } from 'lucide-react';
import { EmptyState, Pagination } from '@/Components/ui';
import BeritaCard from '@/Components/berita/BeritaCard';
import BeritaLayout from '@/Components/berita/BeritaLayout';
import { cn } from '@/lib/utils';

const chipClasses =
    'inline-flex h-11 items-center rounded-full border px-4 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:h-10';

function FilterChip({ href, active, children }) {
    return (
        <Link
            href={href}
            preserveScroll
            aria-current={active ? 'page' : undefined}
            className={cn(
                chipClasses,
                active
                    ? 'border-primary bg-primary-soft text-primary'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
        >
            {children}
        </Link>
    );
}

export default function Index({ beritaList, tipe = null, tipeOptions = [] }) {
    const items = beritaList?.data ?? [];
    const activeLabel = tipeOptions.find((option) => option.value === tipe)?.label;

    return (
        <BeritaLayout>
            <Head title="Kabar - Pondok Pesantren RIYADHUL AMIEN" />

            <div className="py-6 md:py-12">
                <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 md:gap-8 lg:px-8">
                    <header className="space-y-1">
                        <h1 className="text-[22px] font-bold leading-tight tracking-tight text-foreground md:text-2xl">
                            Kabar &amp; Agenda
                        </h1>
                        <p className="max-w-prose text-sm text-muted-foreground">
                            Berita, agenda, pengumuman, dan informasi beasiswa terbaru dari madrasah.
                        </p>
                    </header>

                    <nav aria-label="Filter jenis kabar" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                        <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
                            <li>
                                <FilterChip href={route('berita.index')} active={!tipe}>
                                    Semua
                                </FilterChip>
                            </li>
                            {tipeOptions.map((option) => (
                                <li key={option.value}>
                                    <FilterChip
                                        href={route('berita.index', { tipe: option.value })}
                                        active={tipe === option.value}
                                    >
                                        {option.label}
                                    </FilterChip>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {items.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
                                {items.map((berita) => (
                                    <BeritaCard key={berita.id} berita={berita} />
                                ))}
                            </div>

                            <Pagination links={beritaList.links} label="Navigasi halaman kabar" />
                        </>
                    ) : (
                        <EmptyState
                            icon={Newspaper}
                            title={activeLabel ? `Belum ada ${activeLabel.toLowerCase()}` : 'Belum ada kabar'}
                            description={
                                activeLabel
                                    ? 'Coba pilih jenis kabar lain untuk melihat informasi terbaru.'
                                    : 'Kabar dan agenda madrasah akan tampil di sini setelah diterbitkan.'
                            }
                        />
                    )}
                </div>
            </div>
        </BeritaLayout>
    );
}
