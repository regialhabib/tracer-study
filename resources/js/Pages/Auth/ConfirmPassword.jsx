import { Button, FieldError, Input, Label } from '@/Components/ui';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Konfirmasi Kata Sandi" />

            <div className="flex flex-col gap-6">
                <header className="flex flex-col gap-1 text-center">
                    <h1 className="text-[22px] font-bold tracking-tight text-foreground md:text-2xl">
                        Konfirmasi Kata Sandi
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Halaman ini berisi data penting. Mohon masukkan kata sandi Anda sebelum melanjutkan.
                    </p>
                </header>

                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="password">Kata Sandi</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            autoComplete="current-password"
                            autoFocus
                            invalid={Boolean(errors.password)}
                            aria-describedby={errors.password ? 'password-error' : undefined}
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <FieldError id="password-error" message={errors.password} />
                    </div>

                    <Button type="submit" size="lg" className="mt-2 w-full" loading={processing} loadingText="Memeriksa…">
                        Konfirmasi &amp; Lanjutkan
                    </Button>
                </form>
            </div>
        </GuestLayout>
    );
}
