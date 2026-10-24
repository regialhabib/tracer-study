import { Button, Card, CardContent, CardDescription, CardHeader, FieldError, Input, Label } from '@/Components/ui';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { useRef } from 'react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section aria-labelledby="update-password-title" className={className}>
            <Card>
                <CardHeader>
                    <h2
                        id="update-password-title"
                        className="text-lg font-semibold leading-snug tracking-tight text-foreground"
                    >
                        Ubah Kata Sandi
                    </h2>
                    <CardDescription>
                        Gunakan kata sandi yang panjang dan sulit ditebak agar akun Anda tetap aman.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={updatePassword} className="space-y-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="current_password">Kata sandi saat ini</Label>

                            <Input
                                id="current_password"
                                ref={currentPasswordInput}
                                value={data.current_password}
                                onChange={(e) =>
                                    setData('current_password', e.target.value)
                                }
                                type="password"
                                autoComplete="current-password"
                                invalid={Boolean(errors.current_password)}
                                aria-describedby={errors.current_password ? 'current_password-error' : undefined}
                            />

                            <FieldError id="current_password-error" message={errors.current_password} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password">Kata sandi baru</Label>

                            <Input
                                id="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                type="password"
                                autoComplete="new-password"
                                invalid={Boolean(errors.password)}
                                aria-describedby={errors.password ? 'password-error' : undefined}
                            />

                            <FieldError id="password-error" message={errors.password} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password_confirmation">Konfirmasi kata sandi baru</Label>

                            <Input
                                id="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData('password_confirmation', e.target.value)
                                }
                                type="password"
                                autoComplete="new-password"
                                invalid={Boolean(errors.password_confirmation)}
                                aria-describedby={errors.password_confirmation ? 'password_confirmation-error' : undefined}
                            />

                            <FieldError id="password_confirmation-error" message={errors.password_confirmation} />
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Button
                                type="submit"
                                loading={processing}
                                loadingText="Menyimpan…"
                                className="w-full sm:w-auto"
                            >
                                Simpan Kata Sandi
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="flex items-center gap-1.5 text-sm font-medium text-success">
                                    <CheckCircle2 aria-hidden="true" className="size-4" />
                                    Tersimpan.
                                </p>
                            </Transition>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </section>
    );
}
