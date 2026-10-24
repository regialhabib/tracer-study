import { Button, FieldError, FieldHint, Input, Label, Select } from '@/Components/ui';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

/**
 * Bangun nilai `aria-describedby` dari id teks bantuan dan id pesan error (bila ada).
 */
function describedBy(hintId, errorId, error) {
    const ids = [hintId, error ? errorId : null].filter(Boolean);

    return ids.length > 0 ? ids.join(' ') : undefined;
}

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
            <Head title="Daftar Akun Alumni" />

            <div className="flex flex-col gap-6">
                <header className="flex flex-col gap-1 text-center">
                    <h1 className="text-[22px] font-bold tracking-tight text-foreground md:text-2xl">
                        Daftar Akun Alumni
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Isi data kelulusan Anda agar dapat mengakses kuesioner tracer study.
                    </p>
                </header>

                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="name" required>
                            Nama Lengkap
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            value={data.name}
                            autoComplete="name"
                            placeholder="Sesuai ijazah MA"
                            autoFocus
                            invalid={Boolean(errors.name)}
                            aria-describedby={describedBy(null, 'name-error', errors.name)}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <FieldError id="name-error" message={errors.name} />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="nisn" required>
                                NISN
                            </Label>
                            <FieldHint id="nisn-hint">10 digit angka.</FieldHint>
                            <Input
                                id="nisn"
                                name="nisn"
                                value={data.nisn}
                                inputMode="numeric"
                                placeholder="005XXXXXXX"
                                maxLength="20"
                                className="font-mono"
                                invalid={Boolean(errors.nisn)}
                                aria-describedby={describedBy('nisn-hint', 'nisn-error', errors.nisn)}
                                onChange={(e) => setData('nisn', e.target.value)}
                                required
                            />
                            <FieldError id="nisn-error" message={errors.nisn} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="gender" required>
                                Jenis Kelamin
                            </Label>
                            <Select
                                id="gender"
                                name="gender"
                                value={data.gender}
                                invalid={Boolean(errors.gender)}
                                aria-describedby={describedBy(null, 'gender-error', errors.gender)}
                                onChange={(e) => setData('gender', e.target.value)}
                                required
                            >
                                <option value="L">Laki-laki (Banin)</option>
                                <option value="P">Perempuan (Banat)</option>
                            </Select>
                            <FieldError id="gender-error" message={errors.gender} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="major" required>
                                Peminatan / Jurusan
                            </Label>
                            <Select
                                id="major"
                                name="major"
                                value={data.major}
                                invalid={Boolean(errors.major)}
                                aria-describedby={describedBy(null, 'major-error', errors.major)}
                                onChange={(e) => setData('major', e.target.value)}
                                required
                            >
                                <option value="Keagamaan (PK)">Keagamaan (PK)</option>
                                <option value="MIPA">MIPA</option>
                                <option value="IPS">IPS</option>
                                <option value="Bahasa">Bahasa</option>
                            </Select>
                            <FieldError id="major-error" message={errors.major} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="graduation_year" required>
                                Tahun Kelulusan
                            </Label>
                            <Input
                                id="graduation_year"
                                type="number"
                                name="graduation_year"
                                value={data.graduation_year}
                                min="2010"
                                max={currentYear + 1}
                                className="tabular-nums"
                                invalid={Boolean(errors.graduation_year)}
                                aria-describedby={describedBy(null, 'graduation_year-error', errors.graduation_year)}
                                onChange={(e) => setData('graduation_year', e.target.value)}
                                required
                            />
                            <FieldError id="graduation_year-error" message={errors.graduation_year} />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="email" required>
                            Email Aktif
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            autoComplete="email"
                            placeholder="nama@email.com"
                            invalid={Boolean(errors.email)}
                            aria-describedby={describedBy(null, 'email-error', errors.email)}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <FieldError id="email-error" message={errors.email} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="phone_number">Nomor WhatsApp</Label>
                        <FieldHint id="phone_number-hint">Opsional, agar kami mudah menghubungi Anda.</FieldHint>
                        <Input
                            id="phone_number"
                            type="tel"
                            name="phone_number"
                            value={data.phone_number}
                            autoComplete="tel"
                            inputMode="tel"
                            placeholder="Contoh: 081234567890"
                            invalid={Boolean(errors.phone_number)}
                            aria-describedby={describedBy('phone_number-hint', 'phone_number-error', errors.phone_number)}
                            onChange={(e) => setData('phone_number', e.target.value)}
                        />
                        <FieldError id="phone_number-error" message={errors.phone_number} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="password" required>
                            Kata Sandi
                        </Label>
                        <FieldHint id="password-hint">Minimal 8 karakter.</FieldHint>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            autoComplete="new-password"
                            invalid={Boolean(errors.password)}
                            aria-describedby={describedBy('password-hint', 'password-error', errors.password)}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        <FieldError id="password-error" message={errors.password} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="password_confirmation" required>
                            Ulangi Kata Sandi
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            autoComplete="new-password"
                            invalid={Boolean(errors.password_confirmation)}
                            aria-describedby={describedBy(
                                null,
                                'password_confirmation-error',
                                errors.password_confirmation,
                            )}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                        />
                        <FieldError id="password_confirmation-error" message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" size="lg" className="mt-2 w-full" loading={processing} loadingText="Mendaftarkan…">
                        Daftar Akun
                    </Button>
                </form>

                <p className="border-t border-border pt-4 text-center text-sm text-muted-foreground">
                    Sudah punya akun alumni?{' '}
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
