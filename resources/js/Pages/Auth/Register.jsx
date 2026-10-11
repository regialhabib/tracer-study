import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { GraduationCap } from 'lucide-react';

export default function Register() {
    const currentYear = new Date().getFullYear();

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        nisn: '',
        email: '',
        gender: 'L',
        major: 'Keagamaan (PK)',
        graduation_year: currentYear,
        phone_number: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Pendaftaran Mandiri Santri Alumni" />

            <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <GraduationCap className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-gray-900">
                    Registrasi Mandiri Alumni MA
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                    Daftar akun jika NISN Anda belum terdaftar dalam sistem
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="name" value="Nama Lengkap Santri" />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                        autoComplete="name"
                        placeholder="Nama lengkap sesuai ijazah"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-1" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <InputLabel htmlFor="nisn" value="NISN (10 Digit)" />
                        <TextInput
                            id="nisn"
                            name="nisn"
                            value={data.nisn}
                            className="mt-1 block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                            placeholder="005XXXXXXX"
                            maxLength="20"
                            onChange={(e) => setData('nisn', e.target.value)}
                            required
                        />
                        <InputError message={errors.nisn} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="gender" value="Jenis Kelamin" />
                        <select
                            id="gender"
                            name="gender"
                            value={data.gender}
                            className="mt-1 block w-full rounded-lg border-gray-300 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                            onChange={(e) => setData('gender', e.target.value)}
                            required
                        >
                            <option value="L">Laki-laki (Banin)</option>
                            <option value="P">Perempuan (Banat)</option>
                        </select>
                        <InputError message={errors.gender} className="mt-1" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <InputLabel htmlFor="major" value="Peminatan / Jurusan" />
                        <select
                            id="major"
                            name="major"
                            value={data.major}
                            className="mt-1 block w-full rounded-lg border-gray-300 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                            onChange={(e) => setData('major', e.target.value)}
                            required
                        >
                            <option value="Keagamaan (PK)">Keagamaan (PK)</option>
                            <option value="MIPA">MIPA</option>
                            <option value="IPS">IPS</option>
                            <option value="Bahasa">Bahasa</option>
                        </select>
                        <InputError message={errors.major} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="graduation_year" value="Tahun Lulus" />
                        <input
                            id="graduation_year"
                            type="number"
                            name="graduation_year"
                            value={data.graduation_year}
                            min="2010"
                            max={currentYear + 1}
                            className="mt-1 block w-full rounded-lg border-gray-300 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                            onChange={(e) => setData('graduation_year', e.target.value)}
                            required
                        />
                        <InputError message={errors.graduation_year} className="mt-1" />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Alamat Email Aktif" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                        autoComplete="email"
                        placeholder="nama@email.com"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>

                <div>
                    <InputLabel htmlFor="phone_number" value="Nomor WhatsApp" />
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
                    <InputLabel htmlFor="password" value="Password Akun" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                        autoComplete="new-password"
                        placeholder="Minimal 8 karakter"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value="Ulangi Password" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                        autoComplete="new-password"
                        placeholder="Ketik ulang password"
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
                        {processing ? 'Mendaftarkan...' : 'Daftar Akun Santri'}
                    </PrimaryButton>
                </div>

                <div className="text-center text-xs text-gray-600">
                    Sudah punya akun?{' '}
                    <Link
                        href={route('login')}
                        className="font-semibold text-emerald-700 hover:underline"
                    >
                        Masuk Disini
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
