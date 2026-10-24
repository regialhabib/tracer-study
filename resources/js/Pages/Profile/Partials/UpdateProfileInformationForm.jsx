import { Button, Card, CardContent, CardDescription, CardHeader, FieldError, Input, Label } from '@/Components/ui';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section aria-labelledby="profile-information-title" className={className}>
            <Card>
                <CardHeader>
                    <h2
                        id="profile-information-title"
                        className="text-lg font-semibold leading-snug tracking-tight text-foreground"
                    >
                        Informasi Akun
                    </h2>
                    <CardDescription>
                        Perbarui nama dan alamat email akun Anda.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={submit} className="space-y-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="name" required>
                                Nama lengkap
                            </Label>

                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoFocus
                                autoComplete="name"
                                invalid={Boolean(errors.name)}
                                aria-describedby={errors.name ? 'name-error' : undefined}
                            />

                            <FieldError id="name-error" message={errors.name} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="email" required>
                                Email
                            </Label>

                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                invalid={Boolean(errors.email)}
                                aria-describedby={errors.email ? 'email-error' : undefined}
                            />

                            <FieldError id="email-error" message={errors.email} />
                        </div>

                        {mustVerifyEmail && user.email_verified_at === null && (
                            <div className="space-y-2 rounded-md bg-warning-soft p-3 text-sm text-foreground">
                                <p>
                                    Alamat email Anda belum diverifikasi.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="rounded-sm font-semibold text-brand-blue underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        Kirim ulang email verifikasi.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <p className="flex items-start gap-1.5 font-medium text-success">
                                        <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                                        Tautan verifikasi baru telah dikirim ke email Anda.
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Button
                                type="submit"
                                loading={processing}
                                loadingText="Menyimpan…"
                                className="w-full sm:w-auto"
                            >
                                Simpan Perubahan
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
