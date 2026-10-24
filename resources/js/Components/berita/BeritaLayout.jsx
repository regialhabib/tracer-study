import { usePage } from '@inertiajs/react';
import AlumniLayout from '@/Layouts/AlumniLayout';
import PublicLayout from '@/Layouts/PublicLayout';

/**
 * BeritaLayout — halaman kabar memakai AlumniLayout bagi alumni yang sedang masuk,
 * dan PublicLayout bagi tamu serta admin.
 */
export default function BeritaLayout({ children }) {
    const user = usePage().props.auth?.user;

    if (user && user.role !== 'admin') {
        return <AlumniLayout>{children}</AlumniLayout>;
    }

    return <PublicLayout>{children}</PublicLayout>;
}
