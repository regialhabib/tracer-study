import AlumniLayout from '@/Layouts/AlumniLayout';
import { Head } from '@inertiajs/react';
import { PageHeader } from '@/Components/ui';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AlumniLayout>
            <Head title="Profil" />

            <div className="mx-auto max-w-2xl space-y-4 md:space-y-6">
                <PageHeader
                    title="Profil Akun"
                    description="Kelola data akun, kata sandi, dan keamanan akun Anda."
                />

                <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />

                <UpdatePasswordForm />

                <DeleteUserForm />
            </div>
        </AlumniLayout>
    );
}
