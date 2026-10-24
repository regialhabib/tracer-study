import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, ShieldCheck, UserCheck, UserX } from 'lucide-react';
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
import { ACCOUNT_STATUS_BADGE_VARIANTS, ACCOUNT_STATUS_LABELS } from '@/lib/labels';

const dateFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

function formatDate(value) {
    return value ? dateFormatter.format(new Date(value)) : '-';
}

function StatusBadge({ status }) {
    return (
        <Badge variant={ACCOUNT_STATUS_BADGE_VARIANTS[status] ?? 'neutral'}>
            {ACCOUNT_STATUS_LABELS[status] ?? status}
        </Badge>
    );
}

function RowActions({ admin, onDeactivate, onActivate }) {
    return (
        <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
                <Link href={route('admin.pengguna.edit', admin.id)}>
                    <Pencil aria-hidden="true" />
                    Ubah Data
                </Link>
            </Button>
            {admin.status === 'active' ? (
                <Button
                    size="sm"
                    variant="ghost"
                    disabled={admin.is_self}
                    title={admin.is_self ? 'Anda tidak dapat menonaktifkan akun sendiri.' : undefined}
                    onClick={() => onDeactivate(admin)}
                >
                    <UserX aria-hidden="true" />
                    Nonaktifkan
                </Button>
            ) : (
                <Button size="sm" variant="ghost" onClick={() => onActivate(admin)}>
                    <UserCheck aria-hidden="true" />
                    Aktifkan Kembali
                </Button>
            )}
        </div>
    );
}

export default function Index({ admins, errors = {} }) {
    const [confirming, setConfirming] = useState(null);
    const [processing, setProcessing] = useState(false);

    const deactivate = () => {
        router.patch(
            route('admin.pengguna.deactivate', confirming.id),
            {},
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => {
                    setProcessing(false);
                    setConfirming(null);
                },
            },
        );
    };

    const activate = (admin) => {
        router.patch(route('admin.pengguna.activate', admin.id), {}, { preserveScroll: true });
    };

    const rows = admins.data;

    return (
        <AdminLayout title="Kelola Admin">
            <Head title="Kelola Admin" />

            <div className="flex flex-col gap-6">
                <PageHeader
                    title="Kelola Admin"
                    description="Atur akun admin yang dapat mengelola data alumni dan kuesioner."
                    actions={
                        <Button asChild>
                            <Link href={route('admin.pengguna.create')}>
                                <Plus aria-hidden="true" />
                                Tambah Admin
                            </Link>
                        </Button>
                    }
                />

                {errors.status && (
                    <Alert variant="danger">
                        <AlertDescription>{errors.status}</AlertDescription>
                    </Alert>
                )}

                {rows.length === 0 ? (
                    <Card>
                        <EmptyState
                            icon={ShieldCheck}
                            title="Belum ada admin"
                            description="Tambahkan admin pertama untuk mulai mengelola data."
                        />
                    </Card>
                ) : (
                    <>
                        <Card className="hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Terakhir Diubah</TableHead>
                                        <TableHead>Tindakan</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((admin) => (
                                        <TableRow key={admin.id}>
                                            <TableCell className="font-medium text-foreground">
                                                {admin.name}
                                                {admin.is_self && (
                                                    <span className="ml-2 text-xs font-normal text-muted-foreground">(Anda)</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{admin.email}</TableCell>
                                            <TableCell>
                                                <StatusBadge status={admin.status} />
                                            </TableCell>
                                            <TableCell>{formatDate(admin.updated_at)}</TableCell>
                                            <TableCell>
                                                <RowActions admin={admin} onDeactivate={setConfirming} onActivate={activate} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>

                        <ul className="flex flex-col gap-3 md:hidden">
                            {rows.map((admin) => (
                                <li key={admin.id}>
                                    <Card>
                                        <CardContent className="flex flex-col gap-3 pt-4">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-foreground">
                                                        {admin.name}
                                                        {admin.is_self && (
                                                            <span className="ml-2 text-xs font-normal text-muted-foreground">(Anda)</span>
                                                        )}
                                                    </p>
                                                    <p className="break-all text-sm text-muted-foreground">{admin.email}</p>
                                                </div>
                                                <StatusBadge status={admin.status} />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Terakhir diubah {formatDate(admin.updated_at)}
                                            </p>
                                            <RowActions admin={admin} onDeactivate={setConfirming} onActivate={activate} />
                                        </CardContent>
                                    </Card>
                                </li>
                            ))}
                        </ul>

                        <Pagination links={admins.links} />
                    </>
                )}
            </div>

            <Dialog open={confirming !== null} onClose={() => setConfirming(null)}>
                <DialogHeader>
                    <DialogTitle>Nonaktifkan Admin</DialogTitle>
                    <DialogDescription>
                        {confirming?.name} tidak akan dapat masuk lagi sampai diaktifkan kembali.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setConfirming(null)}>
                        Batal
                    </Button>
                    <Button type="button" variant="destructive" loading={processing} loadingText="Memproses…" onClick={deactivate}>
                        Nonaktifkan Admin
                    </Button>
                </DialogFooter>
            </Dialog>
        </AdminLayout>
    );
}
