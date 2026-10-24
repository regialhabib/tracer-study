import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    FieldError,
    FieldHint,
    Input,
    Label,
    RadioCard,
    RadioCardGroup,
    Textarea,
} from '@/Components/ui';
import { ALUMNI_STATUS_LABELS } from '@/lib/labels';
import { Transition } from '@headlessui/react';
import { Link, useForm } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';

function SectionHeader({ id, title, description }) {
    return (
        <CardHeader>
            <h2 id={id} className="text-lg font-semibold leading-snug tracking-tight text-foreground">
                {title}
            </h2>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
    );
}

export default function AlumniProfileForm({ alumni, mustVerifyEmail, status, className = '' }) {
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        email: alumni.email ?? '',
        phone_number: alumni.phone_number ?? '',
        city: alumni.city ?? '',
        province: alumni.province ?? '',
        address: alumni.address ?? '',
        current_status: alumni.current_status ?? '',
    });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'), { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className={`space-y-4 md:space-y-6 ${className}`}>
            <section aria-labelledby="contact-title">
                <Card>
                    <SectionHeader
                        id="contact-title"
                        title="Kontak & Domisili"
                        description="Gunakan nomor WhatsApp aktif agar admin dapat menghubungi Anda."
                    />

                    <CardContent className="space-y-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="phone_number" required>
                                Nomor WhatsApp
                            </Label>
                            <Input
                                id="phone_number"
                                type="tel"
                                inputMode="tel"
                                value={data.phone_number}
                                onChange={(e) => setData('phone_number', e.target.value)}
                                required
                                autoComplete="tel"
                                placeholder="081234567890"
                                invalid={Boolean(errors.phone_number)}
                                aria-describedby={errors.phone_number ? 'phone_number-error' : undefined}
                            />
                            <FieldError id="phone_number-error" message={errors.phone_number} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="email" required>
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="email"
                                invalid={Boolean(errors.email)}
                                aria-describedby={errors.email ? 'email-error' : undefined}
                            />
                            <FieldError id="email-error" message={errors.email} />
                        </div>

                        {mustVerifyEmail && alumni.email_verified === false && (
                            <div className="space-y-2 rounded-md bg-warning-soft p-3 text-sm text-foreground">
                                <p>
                                    Alamat email Anda belum diverifikasi.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="rounded-sm font-semibold text-brand-blue underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        Kirim ulang email verifikasi.
                                    </Link>
                                </p>
                                {status === 'verification-link-sent' && (
                                    <p className="font-medium text-success">
                                        Tautan verifikasi baru telah dikirim ke email Anda.
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="city">Kota/Kabupaten</Label>
                                <Input
                                    id="city"
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                    autoComplete="address-level2"
                                    invalid={Boolean(errors.city)}
                                    aria-describedby={errors.city ? 'city-error' : undefined}
                                />
                                <FieldError id="city-error" message={errors.city} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="province">Provinsi</Label>
                                <Input
                                    id="province"
                                    value={data.province}
                                    onChange={(e) => setData('province', e.target.value)}
                                    autoComplete="address-level1"
                                    invalid={Boolean(errors.province)}
                                    aria-describedby={errors.province ? 'province-error' : undefined}
                                />
                                <FieldError id="province-error" message={errors.province} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="address">Alamat</Label>
                            <Textarea
                                id="address"
                                rows={3}
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                autoComplete="street-address"
                                invalid={Boolean(errors.address)}
                                aria-describedby={errors.address ? 'address-error' : undefined}
                            />
                            <FieldError id="address-error" message={errors.address} />
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section aria-labelledby="activity-title">
                <Card>
                    <SectionHeader
                        id="activity-title"
                        title="Aktivitas Saat Ini"
                        description="Pilih kegiatan Anda saat ini. Anda dapat memperbaruinya kapan saja."
                    />

                    <CardContent className="space-y-2">
                        <RadioCardGroup
                            name="current_status"
                            value={data.current_status}
                            onValueChange={(value) => setData('current_status', value)}
                            required
                            invalid={Boolean(errors.current_status)}
                            aria-labelledby="activity-title"
                        >
                            {Object.entries(ALUMNI_STATUS_LABELS).map(([value, label]) => (
                                <RadioCard key={value} value={value}>
                                    {label}
                                </RadioCard>
                            ))}
                        </RadioCardGroup>
                        <FieldError message={errors.current_status} />
                        <FieldHint>Perubahan tersimpan setelah Anda menekan tombol simpan.</FieldHint>
                    </CardContent>
                </Card>
            </section>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button type="submit" loading={processing} loadingText="Menyimpan…" className="w-full sm:w-auto">
                    Simpan Perubahan
                </Button>

                <Transition
                    show={recentlySuccessful}
                    enter="transition ease-in-out"
                    enterFrom="opacity-0"
                    leave="transition ease-in-out"
                    leaveTo="opacity-0"
                >
                    <p className="flex items-center gap-1.5 text-sm font-medium text-success">
                        <CheckCircle2 aria-hidden="true" className="size-4" />
                        Tersimpan.
                    </p>
                </Transition>
            </div>
        </form>
    );
}
