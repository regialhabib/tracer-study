import { useEffect, useRef, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Search, Users } from 'lucide-react';
import PesanLayout from '@/Components/pesan/PesanLayout';
import ContactCard from '@/Components/pesan/ContactCard';
import { Button, EmptyState, Input, Label, PageHeader, Pagination, Select } from '@/Components/ui';

export default function Cari({ contacts, filters, filterOptions }) {
    const [q, setQ] = useState(filters.q ?? '');
    const [angkatan, setAngkatan] = useState(filters.angkatan ?? '');
    const [peminatan, setPeminatan] = useState(filters.peminatan ?? '');
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return undefined;
        }

        const timer = setTimeout(() => {
            const params = {};
            if (q.trim() !== '') {
                params.q = q.trim();
            }
            if (angkatan !== '') {
                params.angkatan = angkatan;
            }
            if (peminatan !== '') {
                params.peminatan = peminatan;
            }

            router.get(route('pesan.cari'), params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 350);

        return () => clearTimeout(timer);
    }, [q, angkatan, peminatan]);

    const hasFilter = q.trim() !== '' || angkatan !== '' || peminatan !== '';

    const resetFilters = () => {
        setQ('');
        setAngkatan('');
        setPeminatan('');
    };

    const items = contacts.data ?? [];

    return (
        <PesanLayout title="Cari Kontak">
            <div className="mx-auto max-w-4xl space-y-4 md:space-y-6">
                <PageHeader
                    title="Cari Kontak"
                    description="Temukan alumni atau admin untuk memulai percakapan."
                    actions={
                        <Button asChild variant="outline">
                            <Link href={route('pesan.index')}>
                                <ArrowLeft aria-hidden="true" className="size-4" />
                                Kembali ke Pesan
                            </Link>
                        </Button>
                    }
                />

                <form
                    role="search"
                    onSubmit={(event) => event.preventDefault()}
                    className="grid gap-3 sm:grid-cols-[1fr_10rem_12rem]"
                >
                    <div className="space-y-1.5">
                        <Label htmlFor="cari-nama">Nama</Label>
                        <div className="relative">
                            <Search
                                aria-hidden="true"
                                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                            />
                            <Input
                                id="cari-nama"
                                type="search"
                                value={q}
                                onChange={(event) => setQ(event.target.value)}
                                placeholder="Cari nama…"
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="cari-angkatan">Angkatan</Label>
                        <Select
                            id="cari-angkatan"
                            value={angkatan}
                            onChange={(event) => setAngkatan(event.target.value)}
                            placeholder="Semua angkatan"
                        >
                            {filterOptions.angkatan.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="cari-peminatan">Peminatan</Label>
                        <Select
                            id="cari-peminatan"
                            value={peminatan}
                            onChange={(event) => setPeminatan(event.target.value)}
                            placeholder="Semua peminatan"
                        >
                            {filterOptions.peminatan.map((major) => (
                                <option key={major} value={major}>
                                    {major}
                                </option>
                            ))}
                        </Select>
                    </div>
                </form>

                <p className="text-sm text-muted-foreground" aria-live="polite">
                    {contacts.meta?.total ?? items.length} kontak ditemukan
                </p>

                {items.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        title={hasFilter ? 'Kontak tidak ditemukan' : 'Belum ada kontak'}
                        description={
                            hasFilter
                                ? 'Coba ubah kata kunci atau hapus filter yang dipakai.'
                                : 'Kontak yang dapat Anda hubungi akan tampil di sini.'
                        }
                        action={
                            hasFilter ? (
                                <Button type="button" variant="outline" onClick={resetFilters}>
                                    Hapus Filter
                                </Button>
                            ) : null
                        }
                    />
                ) : (
                    <ul className="grid gap-3 md:grid-cols-2">
                        {items.map((contact) => (
                            <li key={contact.id}>
                                <ContactCard contact={contact} />
                            </li>
                        ))}
                    </ul>
                )}

                <Pagination links={contacts.meta?.links} preserveState label="Halaman kontak" />
            </div>
        </PesanLayout>
    );
}
