import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    Dialog,
    DialogBody,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    FieldError,
    Input,
    Label,
} from '@/Components/ui';
import { useForm } from '@inertiajs/react';
import { TriangleAlert } from 'lucide-react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section aria-labelledby="delete-account-title" className={className}>
            <Card className="border-danger/30">
                <CardHeader>
                    <h2
                        id="delete-account-title"
                        className="flex items-center gap-2 text-lg font-semibold leading-snug tracking-tight text-danger"
                    >
                        <TriangleAlert aria-hidden="true" className="size-5 shrink-0" />
                        Hapus Akun
                    </h2>
                    <CardDescription>
                        Setelah akun dihapus, seluruh data dan jawaban Anda akan terhapus
                        permanen. Simpan terlebih dahulu informasi yang ingin Anda pertahankan.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={confirmUserDeletion}
                        className="w-full sm:w-auto"
                    >
                        Hapus Akun
                    </Button>
                </CardContent>
            </Card>

            <Dialog open={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser}>
                    <DialogHeader>
                        <DialogTitle>Yakin ingin menghapus akun Anda?</DialogTitle>
                        <DialogDescription>
                            Seluruh data akun Anda akan terhapus permanen. Masukkan kata
                            sandi untuk mengonfirmasi penghapusan akun.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogBody className="space-y-1.5">
                        <Label htmlFor="password" className="sr-only">
                            Kata sandi
                        </Label>

                        <Input
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            data-autofocus
                            placeholder="Kata sandi"
                            invalid={Boolean(errors.password)}
                            aria-describedby={errors.password ? 'delete-password-error' : undefined}
                        />

                        <FieldError id="delete-password-error" message={errors.password} />
                    </DialogBody>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={closeModal}>
                            Batal
                        </Button>

                        <Button
                            type="submit"
                            variant="destructive"
                            loading={processing}
                            loadingText="Menghapus…"
                        >
                            Hapus Akun
                        </Button>
                    </DialogFooter>
                </form>
            </Dialog>
        </section>
    );
}
