import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ExternalLink, MoreHorizontal, Newspaper, Pencil, Plus, SearchX, Trash2 } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Button,
    Card,
    CardContent,
    Dialog,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    EmptyState,
    PageHeader,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui';
import BeritaFilters from '@/Components/admin/berita/BeritaFilters';
import BeritaStatusBadge from '@/Components/admin/berita/BeritaStatusBadge';
import BeritaTypeBadge from '@/Components/berita/BeritaTypeBadge';

const dateFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
const numberFormatter = new Intl.NumberFormat('id-ID');

function formatDate(value) {
    return value ? dateFormatter.format(new Date(value)) : '-';
}

function Thumbnail({ item }) {
    return item.thumbnail_src ? (
        <img src={item.thumbnail_src} alt="" className="h-12 w-20 shrink-0 rounded-md border border-border object-cover" />
    ) : (
        <div
            aria-hidden="true"
            className="flex h-12 w-20 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground"
        >
            <Newspaper className="size-5" />
        </div>
    );
}

function RowActions({ item, onDelete }) {
    return (
        <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline">
                <Link href={route('admin.berita.edit', item.id)}>
                    <Pencil aria-hidden="true" />
                    Sunting
                </Link>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger as={Button} variant="ghost" size="icon-sm" aria-label={`Aksi lainnya untuk ${item.title}`}>
                    <MoreHorizontal aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {item.state === 'published' && (
                        <>
                            <DropdownMenuItem icon={ExternalLink} href={route('berita.show', item.slug)}>
                                Lihat di Situs
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </>
                    )}
                    <DropdownMenuItem icon={Trash2} destructive onClick={() => onDelete(item)}>
                        Hapus
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export default function Index({ berita, filters, options }) {
    const [deleting, setDeleting] = useState(null);
    const [processing, setProcessing] = useState(false);

    const hasFilters = Object.keys(filters ?? {}).length > 0;

    const remove = () => {
        router.delete(route('admin.berita.destroy', deleting.id), {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => {
                setProcessing(false);
                setDeleting(null);
            },
        });
    };

    return (
        <AdminLayout title="Berita">
            <Head title="Berita" />
            <div className="space-y-6">
                <PageHeader
                    title="Berita"
                    description={`${numberFormatter.format(berita.total)} konten ${hasFilters ? 'sesuai filter' : 'tersimpan'}.`}
                    actions={
                        <Button asChild>
                            <Link href={route('admin.berita.create')}>
                                <Plus aria-hidden="true" />
                                Tambah Berita
                            </Link>
                        </Button>
                    }
                />

                <Card>
                    <CardContent className="space-y-5 p-4 sm:p-5">
                        <BeritaFilters filters={filters ?? {}} options={options} />

                        {berita.data.length === 0 ? (
                            <EmptyState
                                icon={hasFilters ? SearchX : Newspaper}
                                title={hasFilters ? 'Tidak ada konten yang cocok' : 'Belum ada berita'}
                                description={
                                    hasFilters
                                        ? 'Ubah kata kunci atau atur ulang filter.'
                                        : 'Tulis berita, agenda, atau pengumuman pertama untuk alumni.'
                                }
                                action={
                                    !hasFilters && (
                                        <Button asChild>
                                            <Link href={route('admin.berita.create')}>
                                                <Plus aria-hidden="true" />
                                                Tambah Berita
                                            </Link>
                                        </Button>
                                    )
                                }
                            />
                        ) : (
                            <>
                                <div className="hidden md:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Judul</TableHead>
                                                <TableHead>Tipe</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Waktu Terbit</TableHead>
                                                <TableHead>Tindakan</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {berita.data.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="max-w-sm">
                                                        <div className="flex min-w-0 items-center gap-3">
                                                            <Thumbnail item={item} />
                                                            <span className="min-w-0 font-medium text-foreground">{item.title}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <BeritaTypeBadge type={item.type} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <BeritaStatusBadge state={item.state} />
                                                    </TableCell>
                                                    <TableCell>{formatDate(item.published_at)}</TableCell>
                                                    <TableCell>
                                                        <RowActions item={item} onDelete={setDeleting} />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <ul className="flex flex-col gap-3 md:hidden">
                                    {berita.data.map((item) => (
                                        <li key={item.id} className="space-y-3 rounded-lg border border-border p-3">
                                            <div className="flex items-start gap-3">
                                                <Thumbnail item={item} />
                                                <p className="min-w-0 font-semibold text-foreground">{item.title}</p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                                <BeritaTypeBadge type={item.type} />
                                                <BeritaStatusBadge state={item.state} />
                                                <span>{formatDate(item.published_at)}</span>
                                            </div>
                                            <RowActions item={item} onDelete={setDeleting} />
                                        </li>
                                    ))}
                                </ul>

                                <Pagination links={berita.links} />
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={deleting !== null} onClose={() => setDeleting(null)}>
                <DialogHeader>
                    <DialogTitle>Hapus berita ini?</DialogTitle>
                    <DialogDescription>
                        {deleting?.title} beserta gambar sampulnya akan dihapus permanen dan tidak dapat dikembalikan.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDeleting(null)}>
                        Batal
                    </Button>
                    <Button type="button" variant="destructive" loading={processing} loadingText="Menghapus…" onClick={remove}>
                        Hapus Berita
                    </Button>
                </DialogFooter>
            </Dialog>
        </AdminLayout>
    );
}
