import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    FieldError,
    FieldHint,
} from '@/Components/ui';
import { router } from '@inertiajs/react';
import { Camera, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';

function initialsOf(name) {
    return (name ?? '')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');
}

export default function AlumniAvatarCard({ alumni, className = '' }) {
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
        <section aria-labelledby="avatar-title" className={className}>
            <Card>
                <CardHeader>
                    <h2
                        id="avatar-title"
                        className="text-lg font-semibold leading-snug tracking-tight text-foreground"
                    >
                        Foto Profil
                    </h2>
                    <CardDescription>Format JPG, PNG, atau WebP dengan ukuran maksimal 2 MB.</CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                        <Avatar className="size-24">
                            <AvatarImage src={alumni.avatar_url} alt={`Foto profil ${alumni.name}`} />
                            <AvatarFallback className="text-2xl">{initialsOf(alumni.name)}</AvatarFallback>
                        </Avatar>

                        <div className="flex w-full flex-col gap-2 sm:w-auto">
                            <input
                                ref={fileInput}
                                id="avatar"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="sr-only"
                                onChange={(e) => upload(e.target.files?.[0])}
                            />

                            <Button
                                type="button"
                                loading={busy}
                                onClick={() => fileInput.current?.click()}
                                className="w-full sm:w-auto"
                            >
                                <Camera aria-hidden="true" className="size-4" />
                                {alumni.avatar_url ? 'Ganti Foto' : 'Unggah Foto'}
                            </Button>

                            {alumni.avatar_url && (
                                <Button type="button" variant="outline" disabled={busy} onClick={remove} className="w-full sm:w-auto">
                                    <Trash2 aria-hidden="true" className="size-4" />
                                    Hapus Foto
                                </Button>
                            )}

                            <FieldError message={error} />
                            <FieldHint>Foto akan tampil di profil Anda.</FieldHint>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
