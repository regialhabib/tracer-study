import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { KeyRound, ShieldAlert, Sparkles } from 'lucide-react';

export default function FirstLogin({ user }) {
    const { data, setData, post, processing, errors } = useForm({
        email: user.email || '',
        phone_number: user.profile?.phone_number || '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('first-login.update'));
    };

    return (
        <GuestLayout>
            <Head title="Aktivasi Akun Santri - First Login" />

            <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <Sparkles className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-gray-900">
                    Ahlan wa Sahlan, {user.name}!
                </h2>
                <p className="mt-1 text-xs text-gray-600">
                    Akun Anda telah dibuat melalui pendataan madrasah. Mohon lengkapi email aktif dan buat password baru pribadi Anda untuk melanjutkan.
                </p>
            </div>

            <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-800">
                <div className="flex items-center gap-2 font-semibold">
                    <KeyRound className="h-4 w-4" />
                    <span>Informasi Kelulusan Santri</span>
                </div>
                <div className="mt-1.5 grid grid-cols-2 gap-2 text-gray-700">
                    <div>
                        <span className="text-gray-500">NISN:</span>{' '}
                        <span className="font-mono font-medium">{user.nisn}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Jurusan:</span>{' '}
                        <span className="font-medium">{user.profile?.major || '-'}</span>
                    </div>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="email" value="Alamat Email Aktif" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="nama@email.com"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>

                <div>
                    <InputLabel htmlFor="phone_number" value="Nomor WhatsApp Aktif" />
                    <TextInput
                        id="phone_number"
                        type="tel"
                        name="phone_number"
                        value={data.phone_number}
                        className="mt-1 block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="Contoh: 081234567890"
                        onChange={(e) => setData('phone_number', e.target.value)}
                    />
                    <InputError message={errors.phone_number} className="mt-1" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password Baru Pribadi" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="Minimal 8 karakter"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value="Ulangi Password Baru" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="Ketik ulang password baru Anda"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-1" />
                </div>

                <div className="pt-2">
                    <PrimaryButton
                        className="w-full justify-center bg-emerald-700 py-2.5 text-sm font-semibold hover:bg-emerald-800 focus:bg-emerald-800"
                        disabled={processing}
                    >
                        {processing ? 'Menyimpan...' : 'Simpan & Lanjut ke Dashboard'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
