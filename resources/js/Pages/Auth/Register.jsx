import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { UserPlus, Sparkles } from 'lucide-react';

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

            <Card className="shadow-lg border-slate-200/80 dark:border-slate-800">
                <CardHeader className="space-y-1 text-center pb-4">
                    <div className="flex justify-center mb-1">
                        <Badge variant="emerald" className="gap-1 px-3 py-1 text-xs">
                            <Sparkles className="h-3 w-3" /> Registrasi Mandiri Alumni
                        </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        Buat Akun Santri
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                        Daftarkan data kelulusan Anda untuk mengakses kuesioner tracer study
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="name">Nama Lengkap Santri</Label>
                            <Input
                                id="name"
                                name="name"
                                value={data.name}
                                autoComplete="name"
                                placeholder="Nama sesuai ijazah MA"
                                autoFocus
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && (
                                <p className="text-xs text-red-600 font-medium">{errors.name}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="nisn">NISN (10 Digit)</Label>
                                <Input
                                    id="nisn"
                                    name="nisn"
                                    value={data.nisn}
                                    placeholder="005XXXXXXX"
                                    maxLength="20"
                                    onChange={(e) => setData('nisn', e.target.value)}
                                    required
                                />
                                {errors.nisn && (
                                    <p className="text-xs text-red-600 font-medium">{errors.nisn}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="gender">Jenis Kelamin</Label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={data.gender}
                                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
                                    onChange={(e) => setData('gender', e.target.value)}
                                    required
                                >
                                    <option value="L">Laki-laki (Banin)</option>
                                    <option value="P">Perempuan (Banat)</option>
                                </select>
                                {errors.gender && (
                                    <p className="text-xs text-red-600 font-medium">{errors.gender}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="major">Peminatan / Jurusan</Label>
                                <select
                                    id="major"
                                    name="major"
                                    value={data.major}
                                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
                                    onChange={(e) => setData('major', e.target.value)}
                                    required
                                >
                                    <option value="Keagamaan (PK)">Keagamaan (PK)</option>
                                    <option value="MIPA">MIPA</option>
                                    <option value="IPS">IPS</option>
                                    <option value="Bahasa">Bahasa</option>
                                </select>
                                {errors.major && (
                                    <p className="text-xs text-red-600 font-medium">{errors.major}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="graduation_year">Tahun Kelulusan</Label>
                                <Input
                                    id="graduation_year"
                                    type="number"
                                    name="graduation_year"
                                    value={data.graduation_year}
                                    min="2010"
                                    max={currentYear + 1}
                                    onChange={(e) => setData('graduation_year', e.target.value)}
                                    required
                                />
                                {errors.graduation_year && (
                                    <p className="text-xs text-red-600 font-medium">{errors.graduation_year}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="email">Alamat Email Aktif</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                autoComplete="email"
                                placeholder="alumni@contoh.com"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            {errors.email && (
                                <p className="text-xs text-red-600 font-medium">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="phone_number">Nomor WhatsApp</Label>
                            <Input
                                id="phone_number"
                                type="tel"
                                name="phone_number"
                                value={data.phone_number}
                                placeholder="Contoh: 081234567890"
                                onChange={(e) => setData('phone_number', e.target.value)}
                            />
                            {errors.phone_number && (
                                <p className="text-xs text-red-600 font-medium">{errors.phone_number}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    autoComplete="new-password"
                                    placeholder="Min 8 karakter"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                {errors.password && (
                                    <p className="text-xs text-red-600 font-medium">{errors.password}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="password_confirmation">Ulangi Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    autoComplete="new-password"
                                    placeholder="Ulangi"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                />
                                {errors.password_confirmation && (
                                    <p className="text-xs text-red-600 font-medium">{errors.password_confirmation}</p>
                                )}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium shadow-md shadow-emerald-700/20"
                        >
                            <UserPlus className="h-4 w-4" />
                            {processing ? 'Mendaftarkan Data...' : 'Daftar Akun Santri'}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-4 text-center">
                    <p className="text-xs text-slate-500">
                        Sudah memiliki akun santri?{' '}
                        <Link
                            href={route('login')}
                            className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline dark:text-emerald-400"
                        >
                            Masuk Disini
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </GuestLayout>
    );
}
