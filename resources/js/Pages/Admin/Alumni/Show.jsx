import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ClipboardList, KeyRound } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Alert,
    AlertDescription,
    AlertTitle,
    Avatar,
    AvatarFallback,
    AvatarImage,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    EmptyState,
    PageHeader,
} from '@/Components/ui';
import WhatsAppLink from '@/Components/WhatsAppLink';
import AlumniActions from '@/Components/admin/alumni/AlumniActions';
import { AccountStatusBadge, ActivityStatusBadge } from '@/Components/admin/alumni/AlumniBadges';
import { GENDER_LABELS, labelFor } from '@/lib/labels';
import { initialsFromName } from '@/Layouts/Partials/navigation';

const dateFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

function formatDate(value) {
    return value ? dateFormatter.format(new Date(value)) : '-';
}

function DetailList({ items }) {
    return (
        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {items.map(({ label, value, mono }) => (
                <div key={label} className="min-w-0">
                    <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
                    <dd className={`mt-0.5 break-words text-sm text-foreground ${mono ? 'font-mono' : ''}`}>
                        {value || '-'}
                    </dd>
                </div>
            ))}
        </dl>
    );
}

export default function Show({ alumni, passwordInfo, resetWhatsappUrl }) {
    const isDeleted = Boolean(alumni.deleted_at);
    const location = [alumni.city, alumni.province].filter(Boolean).join(', ');

    return (
        <AdminLayout title="Detail Alumni">
            <Head title={alumni.name} />
            <div className="mx-auto max-w-4xl space-y-6">
                <Button asChild variant="ghost" size="sm" className="-ml-3">
                    <Link href={route('admin.alumni.index')}>
                        <ArrowLeft aria-hidden="true" />
                        Kembali ke Daftar Alumni
                    </Link>
                </Button>

                <PageHeader title={alumni.name} actions={<AlumniActions alumni={alumni} />}>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                        <AccountStatusBadge status={alumni.status} deleted={isDeleted} />
                        <ActivityStatusBadge status={alumni.current_status} />
                    </div>
                </PageHeader>

                {passwordInfo && (
                    <Alert variant="success" icon={KeyRound}>
                        <AlertTitle>Kata sandi awal</AlertTitle>
                        <AlertDescription>
                            <p>{passwordInfo}</p>
                            {resetWhatsappUrl !== undefined && resetWhatsappUrl !== null && (
                                <div className="mt-3">
                                    <WhatsAppLink href={resetWhatsappUrl}>Kirim Info Kata Sandi via WhatsApp</WhatsAppLink>
                                </div>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                {alumni.status === 'inactive' && alumni.rejection_reason && (
                    <Alert variant="warning">
                        <AlertTitle>Akun nonaktif</AlertTitle>
                        <AlertDescription>Alasan: {alumni.rejection_reason}</AlertDescription>
                    </Alert>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Biodata</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="flex items-center gap-4">
                            <Avatar className="size-16">
                                <AvatarImage src={alumni.avatar_url} alt={alumni.name} />
                                <AvatarFallback>{initialsFromName(alumni.name)}</AvatarFallback>
                            </Avatar>
                            <WhatsAppLink href={alumni.whatsapp_url} disabledHint="Nomor WhatsApp belum diisi.">
                                Hubungi via WhatsApp
                            </WhatsAppLink>
                        </div>
                        <DetailList
                            items={[
                                { label: 'NISN', value: alumni.nisn, mono: true },
                                { label: 'Nomor stambuk', value: alumni.stambuk_number },
                                { label: 'Jenis kelamin', value: labelFor(GENDER_LABELS, alumni.gender, '') },
                                {
                                    label: 'Tempat, tanggal lahir',
                                    value: [alumni.birth_place, alumni.birth_date ? formatDate(alumni.birth_date) : null]
                                        .filter(Boolean)
                                        .join(', '),
                                },
                                { label: 'Email', value: alumni.email },
                                { label: 'Nomor WhatsApp', value: alumni.phone_number },
                                { label: 'Kota dan provinsi', value: location },
                                { label: 'Alamat', value: alumni.address },
                            ]}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Data Pesantren</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DetailList
                            items={[
                                { label: 'Tahun masuk', value: alumni.entry_year },
                                { label: 'Tahun lulus', value: alumni.graduation_year },
                                { label: 'Peminatan', value: alumni.major },
                                { label: 'Program pesantren', value: alumni.pesantren_program },
                                { label: 'Jumlah juz tahfidz', value: alumni.tahfidz_count },
                                { label: 'Kompleks asrama', value: alumni.dormitory_complex },
                            ]}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Akun</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DetailList
                            items={[
                                { label: 'Persetujuan data', value: alumni.data_consent_at ? formatDate(alumni.data_consent_at) : 'Belum menyetujui' },
                                { label: 'Wajib ganti kata sandi', value: alumni.first_login ? 'Ya, belum masuk pertama kali' : 'Tidak' },
                            ]}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Riwayat Kuesioner</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <EmptyState
                            icon={ClipboardList}
                            title="Belum tersedia"
                            description="Tersedia setelah modul kuesioner aktif."
                        />
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
