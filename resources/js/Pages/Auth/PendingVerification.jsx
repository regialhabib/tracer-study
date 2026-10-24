import { Alert, AlertDescription, AlertTitle, Button } from '@/Components/ui';
import { formatShortDate } from '@/Components/berita/beritaMeta';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';
import { Hourglass, MessageCircle, ShieldCheck } from 'lucide-react';

export default function PendingVerification({ name, phoneNumber, registeredAt }) {
    const registeredDate = formatShortDate(registeredAt);

    return (
        <GuestLayout>
            <Head title="Menunggu Verifikasi" />

            <div className="flex flex-col gap-6">
                <header className="flex flex-col items-center gap-3 text-center">
                    <span className="flex size-12 items-center justify-center rounded-full bg-warning-soft text-warning">
                        <Hourglass aria-hidden="true" className="size-6" />
                    </span>
                    <div className="flex flex-col gap-1">
                        <h1 className="text-[22px] font-bold tracking-tight text-foreground md:text-2xl">
                            Akun Menunggu Verifikasi
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Terima kasih, {name}. Pendaftaran Anda sudah kami terima
                            {registeredDate ? ` pada ${registeredDate}` : ''}.
                        </p>
                    </div>
                </header>

                <ol className="flex flex-col gap-4 text-sm text-foreground">
                    <li className="flex items-start gap-3">
                        <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
                        <p className="leading-relaxed">
                            Admin madrasah akan mencocokkan data Anda dengan arsip kelulusan. Setelah disetujui,
                            Anda bisa masuk dan langsung mengakses Beranda Alumni.
                        </p>
                    </li>
                    <li className="flex items-start gap-3">
                        <MessageCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
                        <p className="leading-relaxed">
                            Admin dapat menghubungi Anda lewat WhatsApp
                            {phoneNumber ? (
                                <>
                                    {' '}
                                    di nomor <span className="font-mono font-semibold">{phoneNumber}</span>
                                </>
                            ) : null}
                            {' '}bila ada data yang perlu dikonfirmasi atau saat akun sudah aktif.
                        </p>
                    </li>
                </ol>

                <Alert variant="warning">
                    <AlertTitle>Status: Menunggu verifikasi</AlertTitle>
                    <AlertDescription>
                        Anda tidak perlu mendaftar ulang. Silakan coba masuk kembali beberapa saat lagi.
                    </AlertDescription>
                </Alert>

                <Button asChild variant="outline" size="lg" className="w-full">
                    <Link href={route('logout')} method="post" as="button" type="button">
                        Keluar
                    </Link>
                </Button>
            </div>
        </GuestLayout>
    );
}
