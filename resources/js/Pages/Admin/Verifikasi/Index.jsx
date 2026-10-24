import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { CircleCheck, UserCheck, XCircle } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import WhatsAppLink from '@/Components/WhatsAppLink';
import {
    Alert,
    AlertDescription,
    AlertTitle,
    Badge,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogBody,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    EmptyState,
    FieldError,
    Label,
    PageHeader,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Textarea,
} from '@/Components/ui';

const dateFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

function formatDate(value) {
    return value ? dateFormatter.format(new Date(value)) : '-';
}

function RowActions({ registration, busyId, onApprove, onReject }) {
    const busy = busyId === registration.id;

    return (
        <div className="flex flex-wrap gap-2">
            <Button size="sm" loading={busy} loadingText="Memproses…" onClick={() => onApprove(registration)}>
                <CircleCheck aria-hidden="true" />
                Setujui Pendaftaran
            </Button>
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => onReject(registration)}>
                <XCircle aria-hidden="true" />
                Tolak Pendaftaran
            </Button>
        </div>
    );
}

function RejectDialog({ registration, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({ rejection_reason: '' });

    const close = () => {
        reset();
        onClose();
    };

    const submit = (event) => {
        event.preventDefault();
        post(route('admin.verifikasi.reject', registration.id), {
            preserveScroll: true,
            onSuccess: close,
        });
    };

    return (
        <Dialog open onClose={close}>
            <form onSubmit={submit}>
                <DialogHeader>
                    <DialogTitle>Tolak Pendaftaran</DialogTitle>
                    <DialogDescription>
                        Akun {registration.name} akan dinonaktifkan. Alasan akan ditampilkan saat yang bersangkutan mencoba masuk.
                    </DialogDescription>
                </DialogHeader>
                <DialogBody className="flex flex-col gap-1.5">
                    <Label htmlFor="rejection_reason" required>
                        Alasan Penolakan
                    </Label>
                    <Textarea
                        id="rejection_reason"
                        rows={3}
                        maxLength={500}
                        value={data.rejection_reason}
                        invalid={Boolean(errors.rejection_reason)}
                        onChange={(event) => setData('rejection_reason', event.target.value)}
                    />
                    <FieldError message={errors.rejection_reason} />
                </DialogBody>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={close}>
                        Batal
                    </Button>
                    <Button type="submit" variant="destructive" loading={processing} loadingText="Menolak…">
                        Tolak Pendaftaran
                    </Button>
                </DialogFooter>
            </form>
        </Dialog>
    );
}

export default function Index({ registrations, whatsappUrl, whatsappName, errors = {} }) {
    const [busyId, setBusyId] = useState(null);
    const [rejecting, setRejecting] = useState(null);

    const approve = (registration) => {
        router.post(
            route('admin.verifikasi.approve', registration.id),
            {},
            {
                preserveScroll: true,
                onStart: () => setBusyId(registration.id),
                onFinish: () => setBusyId(null),
            },
        );
    };

    const rows = registrations.data;
    const actionProps = { busyId, onApprove: approve, onReject: setRejecting };
    const pageError = errors.status;

    return (
        <AdminLayout title="Verifikasi Pendaftar">
            <Head title="Verifikasi Pendaftar" />

            <div className="flex flex-col gap-6">
                <PageHeader
                    title="Verifikasi Pendaftar"
                    description="Periksa pendaftar mandiri yang menunggu persetujuan. Pendaftar terlama ditampilkan lebih dulu."
                >
                    <Badge variant="warning">{registrations.total} menunggu verifikasi</Badge>
                </PageHeader>

                {pageError && (
                    <Alert variant="danger">
                        <AlertDescription>{pageError}</AlertDescription>
                    </Alert>
                )}

                {whatsappUrl && (
                    <Alert variant="success">
                        <AlertTitle>Akun {whatsappName} sudah aktif</AlertTitle>
                        <AlertDescription className="mt-2 flex flex-col gap-3">
                            Beri tahu yang bersangkutan lewat WhatsApp agar dapat segera masuk.
                            <span>
                                <WhatsAppLink href={whatsappUrl}>Kabari via WhatsApp</WhatsAppLink>
                            </span>
                        </AlertDescription>
                    </Alert>
                )}

                {rows.length === 0 ? (
                    <Card>
                        <EmptyState
                            icon={UserCheck}
                            title="Tidak ada pendaftar yang menunggu"
                            description="Semua pendaftaran mandiri sudah diperiksa. Pendaftar baru akan muncul di sini."
                        />
                    </Card>
                ) : (
                    <>
                        <Card className="hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Pendaftar</TableHead>
                                        <TableHead>NISN</TableHead>
                                        <TableHead>Angkatan</TableHead>
                                        <TableHead>Kontak</TableHead>
                                        <TableHead>Terdaftar</TableHead>
                                        <TableHead>Tindakan</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((registration) => (
                                        <TableRow key={registration.id}>
                                            <TableCell>
                                                <div className="font-medium text-foreground">{registration.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {registration.major ?? '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">{registration.nisn ?? '-'}</TableCell>
                                            <TableCell>{registration.graduation_year ?? '-'}</TableCell>
                                            <TableCell>
                                                <div>{registration.phone_number ?? '-'}</div>
                                                <div className="text-xs text-muted-foreground">{registration.email}</div>
                                            </TableCell>
                                            <TableCell>{formatDate(registration.registered_at)}</TableCell>
                                            <TableCell>
                                                <RowActions registration={registration} {...actionProps} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>

                        <ul className="flex flex-col gap-3 md:hidden">
                            {rows.map((registration) => (
                                <li key={registration.id}>
                                    <Card>
                                        <CardContent className="flex flex-col gap-3 pt-4">
                                            <div>
                                                <p className="font-semibold text-foreground">{registration.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    <span className="font-mono">{registration.nisn ?? '-'}</span> · Angkatan{' '}
                                                    {registration.graduation_year ?? '-'}
                                                </p>
                                            </div>
                                            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                                                <dt className="text-muted-foreground">Peminatan</dt>
                                                <dd>{registration.major ?? '-'}</dd>
                                                <dt className="text-muted-foreground">WhatsApp</dt>
                                                <dd>{registration.phone_number ?? '-'}</dd>
                                                <dt className="text-muted-foreground">Email</dt>
                                                <dd className="break-all">{registration.email}</dd>
                                                <dt className="text-muted-foreground">Terdaftar</dt>
                                                <dd>{formatDate(registration.registered_at)}</dd>
                                            </dl>
                                            <RowActions registration={registration} {...actionProps} />
                                        </CardContent>
                                    </Card>
                                </li>
                            ))}
                        </ul>

                        <Pagination links={registrations.links} />
                    </>
                )}
            </div>

            {rejecting && <RejectDialog registration={rejecting} onClose={() => setRejecting(null)} />}
        </AdminLayout>
    );
}
