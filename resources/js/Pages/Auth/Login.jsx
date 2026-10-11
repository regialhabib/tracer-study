import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { LogIn, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
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
            <Head title="Masuk ke Sistem Tracer Study" />

            <Card className="shadow-lg border-slate-200/80 dark:border-slate-800">
                <CardHeader className="space-y-1 text-center pb-4">
                    <CardTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        Masuk ke Portal
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                        Silakan masukkan NISN Santri atau Email dan password akun Anda
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {status && (
                        <Alert variant="emerald" className="py-2.5">
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertDescription>{status}</AlertDescription>
                        </Alert>
                    )}

                    {loginError && (
                        <Alert variant="destructive" className="py-2.5">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{loginError}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={submit} id="login-form" className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="login">NISN Santri atau Email</Label>
                            <Input
                                id="login"
                                type="text"
                                name="login"
                                value={data.login}
                                autoComplete="username"
                                placeholder="Contoh: 0051234501 atau ustadz@pesantren.sch.id"
                                autoFocus
                                onChange={(e) => setData('login', e.target.value)}
                            />
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Santri menggunakan 10 digit NISN. Ustadz & Admin menggunakan email.
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline dark:text-emerald-400"
                                    >
                                        Lupa password?
                                    </Link>
                                )}
                            </div>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                autoComplete="current-password"
                                placeholder="••••••••"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            {errors.password && (
                                <p className="text-xs text-red-600 dark:text-red-400 font-medium">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="remember"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
                            />
                            <label
                                htmlFor="remember"
                                className="text-xs font-medium leading-none text-slate-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-400 cursor-pointer"
                            >
                                Ingat sesi login saya
                            </label>
                        </div>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium shadow-md shadow-emerald-700/20"
                        >
                            <LogIn className="h-4 w-4" />
                            {processing ? 'Memproses Masuk...' : 'Masuk ke Portal'}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-4 text-center">
                    <p className="text-xs text-slate-500">
                        Belum memiliki akun alumni?{' '}
                        <Link
                            href={route('register')}
                            className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline dark:text-emerald-400"
                        >
                            Daftar Mandiri Disini
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </GuestLayout>
    );
}
