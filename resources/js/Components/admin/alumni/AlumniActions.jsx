import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { KeyRound, Pencil, RotateCcw, Trash2, UserCheck, UserX } from 'lucide-react';
import {
    Button,
    Dialog,
    DialogBody,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    FieldError,
    Label,
    Textarea,
} from '@/Components/ui';

function ConfirmDialog({ open, onClose, title, description, confirmLabel, variant = 'default', processing, onConfirm, children }) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            {children && <DialogBody>{children}</DialogBody>}
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                    Batal
                </Button>
                <Button type="button" variant={variant} loading={processing} onClick={onConfirm}>
                    {confirmLabel}
                </Button>
            </DialogFooter>
        </Dialog>
    );
}

/**
 * Tombol aksi pada halaman detail alumni: ubah, reset kata sandi, aktif/nonaktif, hapus/pulihkan.
 */
export default function AlumniActions({ alumni }) {
    const [dialog, setDialog] = useState(null);
    const [processing, setProcessing] = useState(false);
    const deactivateForm = useForm({ action: 'deactivate', reason: '' });

    const isDeleted = Boolean(alumni.deleted_at);
    const close = () => setDialog(null);

    const send = (method, url, data = {}) => {
        router.visit(url, {
            method,
            data,
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => {
                setProcessing(false);
                close();
            },
        });
    };

    if (isDeleted) {
        return (
            <>
                <Button type="button" onClick={() => setDialog('restore')}>
                    <RotateCcw aria-hidden="true" />
                    Pulihkan Alumni
                </Button>
                <ConfirmDialog
                    open={dialog === 'restore'}
                    onClose={close}
                    title="Pulihkan alumni ini?"
                    description={`Akun ${alumni.name} akan kembali muncul di daftar alumni.`}
                    confirmLabel="Pulihkan"
                    processing={processing}
                    onConfirm={() => send('patch', route('admin.alumni.restore', alumni.id))}
                />
            </>
        );
    }

    const submitDeactivate = () => {
        deactivateForm.patch(route('admin.alumni.status', alumni.id), {
            preserveScroll: true,
            onSuccess: () => {
                deactivateForm.reset();
                close();
            },
        });
    };

    return (
        <>
            <Button asChild>
                <Link href={route('admin.alumni.edit', alumni.id)}>
                    <Pencil aria-hidden="true" />
                    Ubah Data
                </Link>
            </Button>
            <Button type="button" variant="outline" onClick={() => setDialog('reset')}>
                <KeyRound aria-hidden="true" />
                Reset Kata Sandi
            </Button>
            {alumni.status === 'active' ? (
                <Button type="button" variant="outline" onClick={() => setDialog('deactivate')}>
                    <UserX aria-hidden="true" />
                    Nonaktifkan Akun
                </Button>
            ) : (
                <Button type="button" variant="outline" onClick={() => setDialog('activate')}>
                    <UserCheck aria-hidden="true" />
                    Aktifkan Akun
                </Button>
            )}
            <Button type="button" variant="destructive" onClick={() => setDialog('delete')}>
                <Trash2 aria-hidden="true" />
                Hapus Alumni
            </Button>

            <ConfirmDialog
                open={dialog === 'reset'}
                onClose={close}
                title="Reset kata sandi?"
                description="Kata sandi akan dikembalikan ke kata sandi awal (tanggal lahir ddmmyyyy, atau NISN). Alumni wajib menggantinya saat masuk."
                confirmLabel="Reset Kata Sandi"
                processing={processing}
                onConfirm={() => send('post', route('admin.alumni.reset-password', alumni.id))}
            />
            <ConfirmDialog
                open={dialog === 'activate'}
                onClose={close}
                title="Aktifkan akun ini?"
                description={`${alumni.name} akan dapat masuk kembali ke aplikasi.`}
                confirmLabel="Aktifkan Akun"
                processing={processing}
                onConfirm={() => send('patch', route('admin.alumni.status', alumni.id), { action: 'activate' })}
            />
            <ConfirmDialog
                open={dialog === 'delete'}
                onClose={close}
                title="Hapus alumni ini?"
                description="Data dipindahkan dari daftar alumni, tetapi masih dapat dipulihkan nanti."
                confirmLabel="Hapus Alumni"
                variant="destructive"
                processing={processing}
                onConfirm={() => send('delete', route('admin.alumni.destroy', alumni.id))}
            />
            <Dialog open={dialog === 'deactivate'} onClose={close}>
                <DialogHeader>
                    <DialogTitle>Nonaktifkan akun ini?</DialogTitle>
                    <DialogDescription>
                        {alumni.name} tidak akan bisa masuk sampai akunnya diaktifkan kembali.
                    </DialogDescription>
                </DialogHeader>
                <DialogBody className="space-y-1.5">
                    <Label htmlFor="deactivate-reason" required>
                        Alasan penonaktifan
                    </Label>
                    <Textarea
                        id="deactivate-reason"
                        value={deactivateForm.data.reason}
                        onChange={(event) => deactivateForm.setData('reason', event.target.value)}
                        invalid={Boolean(deactivateForm.errors.reason)}
                        maxLength={500}
                        rows={3}
                    />
                    <FieldError message={deactivateForm.errors.reason} />
                </DialogBody>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={close}>
                        Batal
                    </Button>
                    <Button type="button" variant="destructive" loading={deactivateForm.processing} onClick={submitDeactivate}>
                        Nonaktifkan Akun
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
