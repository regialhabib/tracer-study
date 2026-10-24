import AdminLayout from '@/Layouts/AdminLayout';
import AlumniLayout from '@/Layouts/AlumniLayout';
import { Head, usePage } from '@inertiajs/react';
import { PageHeader } from '@/Components/ui';
import AlumniAvatarCard from './Partials/AlumniAvatarCard';
import AlumniProfileForm from './Partials/AlumniProfileForm';
import DeleteUserForm from './Partials/DeleteUserForm';
import OfficialDataCard from './Partials/OfficialDataCard';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status, alumni = null }) {
    const user = usePage().props.auth.user;
    const isAdmin = user?.role === 'admin';
    const Layout = isAdmin ? AdminLayout : AlumniLayout;
    const layoutProps = isAdmin ? { title: 'Profil Akun' } : {};

    return (
        <Layout {...layoutProps}>
            <Head title="Profil" />

            <div className="mx-auto max-w-2xl space-y-4 md:space-y-6">
                <PageHeader
                    title="Profil Akun"
                    description={
                        alumni
                            ? 'Kelola data kontak, aktivitas, foto, dan keamanan akun Anda.'
                            : 'Kelola data akun, kata sandi, dan keamanan akun Anda.'
                    }
                />

                {alumni ? (
                    <>
                        <AlumniAvatarCard alumni={alumni} />
                        <OfficialDataCard alumni={alumni} />
                        <AlumniProfileForm alumni={alumni} mustVerifyEmail={mustVerifyEmail} status={status} />
                    </>
                ) : (
                    <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                )}

                <UpdatePasswordForm />

                <DeleteUserForm />
            </div>
        </Layout>
    );
}
