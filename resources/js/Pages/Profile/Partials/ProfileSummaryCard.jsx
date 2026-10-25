import { Avatar, AvatarFallback, AvatarImage, Badge, Button, Card, FieldError } from '@/Components/ui';
import { initialsFromName } from '@/Layouts/Partials/navigation';
import { statusBgClass } from '@/lib/analitik';
import { ALUMNI_STATUS_LABELS, labelFor } from '@/lib/labels';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { Camera, ShieldCheck, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';

function AvatarUpload({ avatarSrc }) {
    const fileInput = useRef(null);
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);

    const upload = (file) => {
        if (!file) {
            return;
        }

        router.post(
            route('profile.avatar.update'),
            { avatar: file },
            {
                forceFormData: true,
                preserveScroll: true,
                onStart: () => {
                    setBusy(true);
                    setError(null);
                },
                onError: (errors) => setError(errors.avatar ?? 'Foto gagal diunggah.'),
                onFinish: () => {
                    setBusy(false);
                    if (fileInput.current) {
                        fileInput.current.value = '';
                    }
                },
            },
        );
    };

    const remove = () => {
        router.delete(route('profile.avatar.destroy'), {
            preserveScroll: true,
            onStart: () => setBusy(true),
            onFinish: () => setBusy(false),
        });
    };

    return (
        <div className="flex w-full flex-col gap-2">
            <input
                ref={fileInput}
                id="avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => upload(e.target.files?.[0])}
            />

            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={busy}
                    onClick={() => fileInput.current?.click()}
                    className="flex-1"
                >
                    <Camera aria-hidden="true" />
                    {avatarSrc ? 'Ganti Foto' : 'Unggah Foto'}
                </Button>

                {avatarSrc && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={busy}
                        onClick={remove}
                        aria-label="Hapus foto profil"
                        title="Hapus foto profil"
                    >
                        <Trash2 aria-hidden="true" />
                    </Button>
                )}
            </div>

            <FieldError message={error} />
            <p className="text-center text-xs text-muted-foreground">JPG, PNG, atau WebP · maks. 2 MB</p>
        </div>
    );
}

/**
 * Kartu ringkasan profil: foto, nama, identitas singkat, dan badge peran/aktivitas.
 * Pengguna (admin maupun alumni) mengganti atau menghapus foto profil langsung dari kartu ini.
 */
export default function ProfileSummaryCard({ user, alumni = null, className = '' }) {
    const name = alumni?.name ?? user.name;
    const subtitle = alumni
        ? [alumni.graduation_year && `Angkatan ${alumni.graduation_year}`, alumni.major].filter(Boolean).join(' · ')
        : user.email;

    return (
        <Card className={cn('overflow-hidden', className)}>
            <div aria-hidden="true" className="h-20 bg-gradient-to-br from-primary to-primary-hover" />

            <div className="-mt-12 flex flex-col items-center gap-4 px-4 pb-5 text-center md:px-6">
                <Avatar className="size-24 border-4 border-card bg-primary-soft">
                    <AvatarImage src={user.avatar_src} alt={`Foto profil ${name}`} />
                    <AvatarFallback className="bg-primary-soft text-2xl font-semibold text-primary">
                        {initialsFromName(name)}
                    </AvatarFallback>
                </Avatar>

                <div className="min-w-0 space-y-1">
                    <p className="text-lg font-semibold leading-snug text-foreground [overflow-wrap:anywhere]">{name}</p>
                    {subtitle && <p className="text-sm text-muted-foreground [overflow-wrap:anywhere]">{subtitle}</p>}
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                    {alumni ? (
                        <>
                            <Badge variant="success">Alumni</Badge>
                            {alumni.current_status && (
                                <Badge variant="neutral">
                                    <span
                                        aria-hidden="true"
                                        className={cn('size-2 rounded-full', statusBgClass(alumni.current_status))}
                                    />
                                    {labelFor(ALUMNI_STATUS_LABELS, alumni.current_status, 'Lainnya')}
                                </Badge>
                            )}
                        </>
                    ) : (
                        <Badge variant="success" icon={ShieldCheck}>
                            Admin
                        </Badge>
                    )}
                </div>

                <AvatarUpload avatarSrc={user.avatar_src} />
            </div>
        </Card>
    );
}
