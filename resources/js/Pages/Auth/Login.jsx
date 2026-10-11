import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { GraduationCap, ShieldCheck } from 'lucide-react';

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

    return (
        <GuestLayout>
            <Head title="Masuk ke Sistem Tracer Study" />

            <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <GraduationCap className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-gray-900">
                    Tracer Study MA & Pondok Pesantren
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                    Masuk untuk melengkapi kuesioner kelulusan & silaturahmi alumni
                </p>
            </div>

            {status && (
                <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="login" value="NISN Santri atau Email" />

                    <TextInput
                        id="login"
                        type="text"
                        name="login"
                        value={data.login}
                        className="mt-1 block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                        autoComplete="username"
                        placeholder="Contoh: 0051234501 atau admin@pesantren.sch.id"
                        isFocused={true}
                        onChange={(e) => setData('login', e.target.value)}
                    />

                    <p className="mt-1 text-xs text-gray-500">
                        *Santri dapat menggunakan 10 digit NISN, ustadz/admin menggunakan email.
                    </p>

                    <InputError message={errors.login || errors.email} className="mt-1" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                        autoComplete="current-password"
                        placeholder="Masukkan password akun Anda"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center text-gray-600">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="ms-2 text-xs">Ingat sesi saya</span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-xs text-emerald-700 hover:underline"
                        >
                            Lupa password?
                        </Link>
                    )}
                </div>

                <div>
                    <PrimaryButton
                        className="w-full justify-center bg-emerald-700 py-2.5 text-sm font-semibold hover:bg-emerald-800 focus:bg-emerald-800 active:bg-emerald-900"
                        disabled={processing}
                    >
                        {processing ? 'Memproses...' : 'Masuk ke Portal'}
                    </PrimaryButton>
                </div>

                <div className="pt-2 text-center text-xs text-gray-600">
                    Belum terdaftar di sistem?{' '}
                    <Link
                        href={route('register')}
                        className="font-semibold text-emerald-700 hover:underline"
                    >
                        Daftar Mandiri Disini
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
