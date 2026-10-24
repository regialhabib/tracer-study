import { Alert, AlertDescription, Button } from '@/Components/ui';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Verifikasi Email" />

            <div className="flex flex-col gap-6">
                <header className="flex flex-col gap-1 text-center">
                    <h1 className="text-[22px] font-bold tracking-tight text-foreground md:text-2xl">
                        Verifikasi Email Anda
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Terima kasih telah mendaftar. Sebelum melanjutkan, mohon buka tautan verifikasi yang
                        kami kirimkan ke email Anda. Belum menerima email? Kami dengan senang hati
                        mengirimkannya kembali.
                    </p>
                </header>

                {status === 'verification-link-sent' && (
                    <Alert variant="success">
                        <AlertDescription>
                            Tautan verifikasi baru telah dikirim ke email yang Anda gunakan saat mendaftar.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="flex flex-col gap-3">
                    <form onSubmit={submit}>
                        <Button type="submit" size="lg" className="w-full" loading={processing} loadingText="Mengirim…">
                            Kirim Ulang Email Verifikasi
                        </Button>
                    </form>

                    <Button asChild variant="ghost" size="lg" className="w-full">
                        <Link href={route('logout')} method="post" as="button" type="button">
                            Keluar
                        </Link>
                    </Button>
                </div>
            </div>
        </GuestLayout>
    );
}
