import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ClipboardList, Copy, Eye, MoreHorizontal, Pencil, Plus, Power, Trash2 } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Alert,
    AlertDescription,
    Badge,
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
import { KUESIONER_STATUS_BADGE_VARIANTS, KUESIONER_STATUS_LABELS } from '@/lib/kuesioner';
import StatusChangeDialog from '@/Components/admin/kuesioner/StatusChangeDialog';
import { STATUS_ACTIONS, formatDate, formatTargets } from '@/Components/admin/kuesioner/statusActions';

function StatusBadge({ status }) {
    return <Badge variant={KUESIONER_STATUS_BADGE_VARIANTS[status] ?? 'neutral'}>{KUESIONER_STATUS_LABELS[status] ?? status}</Badge>;
}

function RowActions({ item, onChangeStatus, onDelete }) {
    const duplicate = () => router.post(route('admin.kuesioner.duplicate', item.id), {}, { preserveScroll: true });

    return (
        <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline">
                <Link href={route('admin.kuesioner.edit', item.id)}>
                    <Pencil aria-hidden="true" />
                    Sunting
                </Link>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger as={Button} variant="ghost" size="icon-sm" aria-label={`Aksi lainnya untuk ${item.title}`}>
                    <MoreHorizontal aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem icon={Eye} href={route('admin.kuesioner.preview', item.id)}>
                        Pratinjau
                    </DropdownMenuItem>
                    <DropdownMenuItem icon={Copy} onClick={duplicate}>
                        Duplikat
                    </DropdownMenuItem>
                    {item.allowed_transitions.map((transition) => (
                        <DropdownMenuItem key={transition.value} icon={Power} onClick={() => onChangeStatus(item, transition.value)}>
                            {STATUS_ACTIONS[transition.value]?.label ?? transition.label}
                        </DropdownMenuItem>
                    ))}
                    {item.can_delete && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem icon={Trash2} destructive onClick={() => onDelete(item)}>
                                Hapus
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export default function Index({ kuesionerList, errors = {} }) {
    const [statusChange, setStatusChange] = useState({ item: null, target: null });
    const [deleting, setDeleting] = useState(null);
    const [processing, setProcessing] = useState(false);

    const rows = kuesionerList.data;
    const errorMessage = errors.status ?? errors.destroy;

    const remove = () => {
        router.delete(route('admin.kuesioner.destroy', deleting.id), {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => {
                setProcessing(false);
                setDeleting(null);
            },
        });
    };

    const actions = {
        onChangeStatus: (item, target) => setStatusChange({ item, target }),
        onDelete: setDeleting,
    };

    return (
        <AdminLayout title="Kuesioner">
            <Head title="Kuesioner" />

            <div className="flex flex-col gap-6">
                <PageHeader
                    title="Kuesioner"
                    description="Susun kuesioner tracer study, atur periode dan angkatan sasaran, lalu aktifkan agar dapat diisi alumni."
                    actions={
                        <Button asChild>
                            <Link href={route('admin.kuesioner.create')}>
                                <Plus aria-hidden="true" />
                                Buat Kuesioner
                            </Link>
                        </Button>
                    }
                />

                {errorMessage && (
                    <Alert variant="danger">
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                )}

                {rows.length === 0 ? (
                    <Card>
                        <EmptyState
                            icon={ClipboardList}
                            title="Belum ada kuesioner"
                            description="Buat kuesioner pertama untuk mulai mengumpulkan data alumni."
                            action={
                                <Button asChild>
                                    <Link href={route('admin.kuesioner.create')}>
                                        <Plus aria-hidden="true" />
                                        Buat Kuesioner
                                    </Link>
                                </Button>
                            }
                        />
                    </Card>
                ) : (
                    <>
                        <Card className="hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Judul</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Periode</TableHead>
                                        <TableHead>Target Angkatan</TableHead>
                                        <TableHead numeric>Pertanyaan</TableHead>
                                        <TableHead numeric>Respon Terkirim</TableHead>
                                        <TableHead>Tindakan</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="max-w-xs font-medium text-foreground">{item.title}</TableCell>
                                            <TableCell>
                                                <StatusBadge status={item.status} />
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(item.start_date)} – {formatDate(item.end_date)}
                                            </TableCell>
                                            <TableCell>{formatTargets(item.target_graduation_years)}</TableCell>
                                            <TableCell numeric>{item.pertanyaan_count.toLocaleString('id-ID')}</TableCell>
                                            <TableCell numeric>{item.submitted_count.toLocaleString('id-ID')}</TableCell>
                                            <TableCell>
                                                <RowActions item={item} {...actions} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>

                        <ul className="flex flex-col gap-3 md:hidden">
                            {rows.map((item) => (
                                <li key={item.id}>
                                    <Card>
                                        <CardContent className="flex flex-col gap-3 pt-4">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="min-w-0 font-semibold text-foreground">{item.title}</p>
                                                <StatusBadge status={item.status} />
                                            </div>
                                            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                                                <dt className="text-muted-foreground">Periode</dt>
                                                <dd className="text-right">
                                                    {formatDate(item.start_date)} – {formatDate(item.end_date)}
                                                </dd>
                                                <dt className="text-muted-foreground">Target angkatan</dt>
                                                <dd className="text-right">{formatTargets(item.target_graduation_years)}</dd>
                                                <dt className="text-muted-foreground">Pertanyaan</dt>
                                                <dd className="text-right">{item.pertanyaan_count.toLocaleString('id-ID')}</dd>
                                                <dt className="text-muted-foreground">Respon terkirim</dt>
                                                <dd className="text-right">{item.submitted_count.toLocaleString('id-ID')}</dd>
                                            </dl>
                                            <RowActions item={item} {...actions} />
                                        </CardContent>
                                    </Card>
                                </li>
                            ))}
                        </ul>

                        <Pagination links={kuesionerList.links} />
                    </>
                )}
            </div>

            <StatusChangeDialog
                kuesioner={statusChange.item}
                target={statusChange.target}
                onClose={() => setStatusChange({ item: null, target: null })}
            />

            <Dialog open={deleting !== null} onClose={() => setDeleting(null)}>
                <DialogHeader>
                    <DialogTitle>Hapus kuesioner ini?</DialogTitle>
                    <DialogDescription>
                        {deleting?.title} beserta seluruh pertanyaannya akan dihapus permanen dan tidak dapat dikembalikan.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDeleting(null)}>
                        Batal
                    </Button>
                    <Button type="button" variant="destructive" loading={processing} loadingText="Menghapus…" onClick={remove}>
                        Hapus Kuesioner
                    </Button>
                </DialogFooter>
            </Dialog>
        </AdminLayout>
    );
}
