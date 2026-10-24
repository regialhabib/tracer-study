import DataConsentField from '@/Components/DataConsentField';
import { Button, FieldError, FieldHint, Input, Label } from '@/Components/ui';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

/**
 * Bangun nilai `aria-describedby` dari id teks bantuan dan id pesan error (bila ada).
 */
function describedBy(hintId, errorId, error) {
    const ids = [hintId, error ? errorId : null].filter(Boolean);

    return ids.length > 0 ? ids.join(' ') : undefined;
}

/**
 * Onboarding login pertama.
 * - Alumni: email aktif, nomor WhatsApp, persetujuan data, dan kata sandi baru.
 * - Admin: cukup kata sandi baru (email boleh dibiarkan seperti semula).
 */
export default function FirstLogin({ user, isAdmin = false, consent = null }) {
    const { data, setData, post, processing, errors, transform } = useForm({
        email: user.email || '',
        phone_number: user.profile?.phone_number || '',
        data_consent: false,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        transform((formData) => {
            if (!isAdmin) {
                return formData;
            }

            return {
                email: formData.email,
                password: formData.password,
                password_confirmation: formData.password_confirmation,
            };
        });

        post(route('first-login.update'));
    };

    return (
        <GuestLayout>
            <Head title={isAdmin ? 'Ganti Kata Sandi' : 'Lengkapi Akun'} />

            <div className="flex flex-col gap-6">
                <header className="flex flex-col gap-1 text-center">
                    <p className="text-sm font-medium text-primary">Ahlan wa sahlan, {user.name}</p>
                    <h1 className="text-[22px] font-bold tracking-tight text-foreground md:text-2xl">
                        {isAdmin ? 'Ganti Kata Sandi Awal' : 'Lengkapi Akun Anda'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {isAdmin
                            ? 'Demi keamanan panel admin, ganti kata sandi awal Anda sebelum melanjutkan.'
                            : 'Lengkapi akun Anda sebelum melanjutkan. Kami memerlukan email dan nomor WhatsApp aktif untuk mengirim informasi tracer study, serta kata sandi baru agar akun Anda tetap aman.'}
                    </p>
                </header>

                {!isAdmin && (
                    <dl className="grid grid-cols-2 gap-3 rounded-lg bg-muted px-4 py-3 text-sm">
                        <div className="flex min-w-0 flex-col gap-0.5">
                            <dt className="text-xs font-medium text-muted-foreground">NISN</dt>
                            <dd className="break-all font-mono font-medium text-foreground">{user.nisn || '-'}</dd>
                        </div>
                        <div className="flex min-w-0 flex-col gap-0.5">
                            <dt className="text-xs font-medium text-muted-foreground">Jurusan</dt>
                            <dd className="break-words font-medium text-foreground">{user.profile?.major || '-'}</dd>
                        </div>
                    </dl>
                )}

                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="email" required={!isAdmin}>
                            Email Aktif
                        </Label>
                        {isAdmin && (
                            <FieldHint id="email-hint">Biarkan seperti semula bila tidak ingin mengubahnya.</FieldHint>
                        )}
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            autoComplete="email"
                            placeholder="nama@email.com"
                            invalid={Boolean(errors.email)}
                            aria-describedby={describedBy(isAdmin ? 'email-hint' : null, 'email-error', errors.email)}
                            onChange={(e) => setData('email', e.target.value)}
                            required={!isAdmin}
                        />
                        <FieldError id="email-error" message={errors.email} />
                    </div>

                    {!isAdmin && (
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="phone_number" required>
                                Nomor WhatsApp Aktif
                            </Label>
                            <FieldHint id="phone_number-hint">
                                Dipakai admin madrasah untuk mengabari Anda, mis. saat kuesioner dibuka.
                            </FieldHint>
                            <Input
                                id="phone_number"
                                type="tel"
                                name="phone_number"
                                value={data.phone_number}
                                autoComplete="tel"
                                inputMode="tel"
                                placeholder="Contoh: 081234567890"
                                invalid={Boolean(errors.phone_number)}
                                aria-describedby={describedBy(
                                    'phone_number-hint',
                                    'phone_number-error',
                                    errors.phone_number,
                                )}
                                onChange={(e) => setData('phone_number', e.target.value)}
                                required
                            />
                            <FieldError id="phone_number-error" message={errors.phone_number} />
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="password" required>
                            Kata Sandi Baru
                        </Label>
                        <FieldHint id="password-hint">Minimal 8 karakter. Jangan bagikan kepada siapa pun.</FieldHint>
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
                            Ulangi Kata Sandi Baru
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

                    {!isAdmin && (
                        <DataConsentField
                            consent={consent}
                            checked={data.data_consent}
                            onChange={(checked) => setData('data_consent', checked)}
                            error={errors.data_consent}
                        />
                    )}

                    <Button type="submit" size="lg" className="mt-2 w-full" loading={processing} loadingText="Menyimpan…">
                        Simpan &amp; Lanjutkan
                    </Button>
                </form>
            </div>
        </GuestLayout>
    );
}
