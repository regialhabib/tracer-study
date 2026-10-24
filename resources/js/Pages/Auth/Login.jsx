import { Alert, AlertDescription, Button, Checkbox, FieldError, FieldHint, Input, Label } from '@/Components/ui';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const loginError = errors.login || errors.email;

    return (
        <GuestLayout>
            <Head title="Masuk" />

            <div className="flex flex-col gap-6">
                <header className="flex flex-col gap-1 text-center">
                    <h1 className="text-[22px] font-bold tracking-tight text-foreground md:text-2xl">
                        Masuk ke Akun Alumni
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Silakan masuk untuk mengisi kuesioner dan memperbarui data Anda.
                    </p>
                </header>

                {status && (
                    <Alert variant="success">
                        <AlertDescription>{status}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="login">NISN atau Email</Label>
                        <FieldHint id="login-hint">Gunakan NISN atau email yang terdaftar.</FieldHint>
                        <Input
                            id="login"
                            type="text"
                            name="login"
                            value={data.login}
                            autoComplete="username"
                            placeholder="Contoh: 0051234501 atau nama@email.com"
                            autoFocus
                            invalid={Boolean(loginError)}
                            aria-describedby={loginError ? 'login-hint login-error' : 'login-hint'}
                            onChange={(e) => setData('login', e.target.value)}
                        />
                        <FieldError id="login-error" message={loginError} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="password">Kata Sandi</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            autoComplete="current-password"
                            invalid={Boolean(errors.password)}
                            aria-describedby={errors.password ? 'password-hint password-error' : 'password-hint'}
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <FieldError id="password-error" message={errors.password} />
                        <FieldHint id="password-hint">
                            Lupa kata sandi? Hubungi admin madrasah untuk reset.
                        </FieldHint>
                    </div>

                    <Checkbox
                        id="remember"
                        name="remember"
                        checked={data.remember}
                        label="Ingat saya di perangkat ini"
                        onChange={(e) => setData('remember', e.target.checked)}
                    />

                    <Button type="submit" size="lg" className="mt-2 w-full" loading={processing} loadingText="Memproses…">
                        Masuk
                    </Button>
                </form>

                <p className="border-t border-border pt-4 text-center text-sm text-muted-foreground">
                    Belum punya akun alumni?{' '}
                    <Link
                        href={route('register')}
                        className="rounded-sm font-semibold text-brand-blue underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        Daftar Akun
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
