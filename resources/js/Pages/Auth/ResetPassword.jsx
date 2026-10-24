import { Button, FieldError, FieldHint, Input, Label } from '@/Components/ui';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Atur Ulang Kata Sandi" />

            <div className="flex flex-col gap-6">
                <header className="flex flex-col gap-1 text-center">
                    <h1 className="text-[22px] font-bold tracking-tight text-foreground md:text-2xl">
                        Buat Kata Sandi Baru
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Silakan buat kata sandi baru untuk akun Anda.
                    </p>
                </header>

                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            autoComplete="username"
                            invalid={Boolean(errors.email)}
                            aria-describedby={errors.email ? 'email-error' : undefined}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <FieldError id="email-error" message={errors.email} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="password">Kata Sandi Baru</Label>
                        <FieldHint id="password-hint">Minimal 8 karakter.</FieldHint>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            autoComplete="new-password"
                            autoFocus
                            invalid={Boolean(errors.password)}
                            aria-describedby={errors.password ? 'password-hint password-error' : 'password-hint'}
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <FieldError id="password-error" message={errors.password} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="password_confirmation">Ulangi Kata Sandi Baru</Label>
                        <Input
                            type="password"
                            id="password_confirmation"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            autoComplete="new-password"
                            invalid={Boolean(errors.password_confirmation)}
                            aria-describedby={
                                errors.password_confirmation ? 'password_confirmation-error' : undefined
                            }
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                        />
                        <FieldError id="password_confirmation-error" message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" size="lg" className="mt-2 w-full" loading={processing} loadingText="Menyimpan…">
                        Simpan Kata Sandi Baru
                    </Button>
                </form>
            </div>
        </GuestLayout>
    );
}
