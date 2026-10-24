import { Alert, AlertDescription, Button, FieldError, Input, Label } from '@/Components/ui';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Lupa Kata Sandi" />

            <div className="flex flex-col gap-6">
                <header className="flex flex-col gap-1 text-center">
                    <h1 className="text-[22px] font-bold tracking-tight text-foreground md:text-2xl">
                        Lupa Kata Sandi?
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Tidak masalah. Masukkan email yang terdaftar, lalu kami kirimkan tautan untuk membuat
                        kata sandi baru.
                    </p>
                </header>

                {status && (
                    <Alert variant="success">
                        <AlertDescription>{status}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            autoComplete="email"
                            placeholder="nama@email.com"
                            autoFocus
                            invalid={Boolean(errors.email)}
                            aria-describedby={errors.email ? 'email-error' : undefined}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <FieldError id="email-error" message={errors.email} />
                    </div>

                    <Button type="submit" size="lg" className="mt-2 w-full" loading={processing} loadingText="Mengirim…">
                        Kirim Tautan Atur Ulang
                    </Button>
                </form>

                <p className="border-t border-border pt-4 text-center text-sm text-muted-foreground">
                    Sudah ingat kata sandi Anda?{' '}
                    <Link
                        href={route('login')}
                        className="rounded-sm font-semibold text-brand-blue underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        Masuk
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
