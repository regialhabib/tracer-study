import { Head, Link } from '@inertiajs/react';
import { House, RotateCw, SearchX, ServerCrash, ShieldAlert, TimerOff, Wrench } from 'lucide-react';
import { Button } from '@/Components/ui';
import PublicLayout from '@/Layouts/PublicLayout';

/**
 * Halaman error Inertia (403/404/419/500/503), dirender dari `bootstrap/app.php`.
 *
 * Props:
 * - `status` kode status HTTP.
 */
const errorMessages = {
    403: {
        icon: ShieldAlert,
        title: 'Akses Ditolak',
        description:
            'Maaf, Anda tidak memiliki izin untuk membuka halaman ini. Jika menurut Anda ini keliru, silakan hubungi admin pesantren.',
    },
    404: {
        icon: SearchX,
        title: 'Halaman Tidak Ditemukan',
        description:
            'Halaman yang Anda cari tidak ada atau sudah dipindahkan. Periksa kembali alamatnya, atau kembali ke beranda.',
    },
    419: {
        icon: TimerOff,
        title: 'Sesi Telah Berakhir',
        description:
            'Demi keamanan, sesi Anda berakhir karena terlalu lama tidak aktif. Silakan muat ulang halaman, lalu coba lagi.',
        canRetry: true,
    },
    500: {
        icon: ServerCrash,
        title: 'Terjadi Kesalahan',
        description: 'Maaf, ada gangguan di server kami. Silakan coba beberapa saat lagi.',
        canRetry: true,
    },
    503: {
        icon: Wrench,
        title: 'Sedang Dalam Perawatan',
        description: 'Sistem sedang kami perbarui agar lebih baik. Silakan kembali beberapa saat lagi.',
        canRetry: true,
    },
};

export default function ErrorPage({ status }) {
    const message = errorMessages[status] ?? errorMessages[500];
    const Icon = message.icon;

    return (
        <PublicLayout>
            <Head title={message.title} />

            <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center sm:px-6 md:py-24">
                <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Icon aria-hidden="true" className="size-6" />
                </span>

                <p className="mt-6 text-sm font-semibold tabular-nums text-primary">Kode {status}</p>
                <h1 className="mt-2 text-[22px] font-bold leading-tight tracking-tight text-foreground md:text-2xl">
                    {message.title}
                </h1>
                <p className="mt-3 max-w-prose text-sm text-muted-foreground">{message.description}</p>

                <div className="mt-8 flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row">
                    {message.canRetry && (
                        <Button variant="outline" className="h-11 sm:h-10" onClick={() => window.location.reload()}>
                            <RotateCw aria-hidden="true" />
                            Coba Lagi
                        </Button>
                    )}
                    <Button asChild className="h-11 sm:h-10">
                        <Link href="/">
                            <House aria-hidden="true" />
                            Kembali ke Beranda
                        </Link>
                    </Button>
                </div>
            </section>
        </PublicLayout>
    );
}
