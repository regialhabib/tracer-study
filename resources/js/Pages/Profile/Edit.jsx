import AdminLayout from '@/Layouts/AdminLayout';
import AlumniLayout from '@/Layouts/AlumniLayout';
import { Head, usePage } from '@inertiajs/react';
import { Card, PageHeader } from '@/Components/ui';
import { IdCard, KeyRound, MessageCircle, Trash2, UserRound } from 'lucide-react';
import AlumniProfileForm from './Partials/AlumniProfileForm';
import DeleteUserForm from './Partials/DeleteUserForm';
import OfficialDataCard from './Partials/OfficialDataCard';
import PengaturanPesanForm from './Partials/PengaturanPesanForm';
import ProfileSummaryCard from './Partials/ProfileSummaryCard';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

function SectionNav({ items }) {
    return (
        <Card className="hidden p-2 lg:block">
            <nav aria-label="Bagian profil">
                <ul className="flex flex-col gap-0.5">
                    {items.map(({ id, label, icon: Icon }) => (
                        <li key={id}>
                            <a
                                href={`#${id}`}
                                className="flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <Icon aria-hidden="true" className="size-4 shrink-0" />
                                {label}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </Card>
    );
}

export default function Edit({ mustVerifyEmail, status, alumni = null, pesanSettings = null, blockedUsers = [] }) {
    const user = usePage().props.auth.user;
    const isAdmin = user?.role === 'admin';
    const Layout = isAdmin ? AdminLayout : AlumniLayout;
    const layoutProps = isAdmin ? { title: 'Profil Akun' } : {};

    const sections = [
        ...(alumni
            ? [
                  { id: 'data-resmi', label: 'Data Resmi', icon: IdCard },
                  { id: 'data-diri', label: 'Kontak & Aktivitas', icon: UserRound },
              ]
            : [{ id: 'data-diri', label: 'Informasi Akun', icon: UserRound }]),
        { id: 'pesan', label: 'Pengaturan Pesan', icon: MessageCircle },
        { id: 'kata-sandi', label: 'Kata Sandi', icon: KeyRound },
        { id: 'hapus-akun', label: 'Hapus Akun', icon: Trash2 },
    ];

    return (
        <Layout {...layoutProps}>
            <Head title="Profil" />

            <div className="mx-auto max-w-5xl space-y-6">
                <PageHeader
                    title="Profil Akun"
                    description={
                        alumni
                            ? 'Kelola data kontak, aktivitas, foto, dan keamanan akun Anda.'
                            : 'Kelola foto, data akun, kata sandi, dan keamanan akun Anda.'
                    }
                />

                <div className="grid gap-4 md:gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
                    <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
                        <ProfileSummaryCard user={user} alumni={alumni} />
                        <SectionNav items={sections} />
                    </aside>

                    <div className="flex min-w-0 flex-col gap-4 md:gap-6">
                        {alumni ? (
                            <>
                                <div id="data-resmi" className="scroll-mt-24">
                                    <OfficialDataCard alumni={alumni} />
                                </div>
                                <div id="data-diri" className="scroll-mt-24">
                                    <AlumniProfileForm alumni={alumni} mustVerifyEmail={mustVerifyEmail} status={status} />
                                </div>
                            </>
                        ) : (
                            <div id="data-diri" className="scroll-mt-24">
                                <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                            </div>
                        )}

                        <div id="pesan" className="scroll-mt-24">
                            <PengaturanPesanForm pesanSettings={pesanSettings} blockedUsers={blockedUsers} />
                        </div>

                        <div id="kata-sandi" className="scroll-mt-24">
                            <UpdatePasswordForm />
                        </div>

                        <div id="hapus-akun" className="scroll-mt-24">
                            <DeleteUserForm />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
