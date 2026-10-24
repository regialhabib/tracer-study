import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AlumniLayout from '@/Layouts/AlumniLayout';

/**
 * PesanLayout — pembungkus semua halaman modul pesan.
 * Memasang `<Head title>` dan memilih AdminLayout (peran admin) atau AlumniLayout (selain itu).
 *
 * Props: `title` judul halaman, `children` isi halaman.
 */
export default function PesanLayout({ title, children }) {
    const role = usePage().props.auth?.user?.role;
    const Layout = role === 'admin' ? AdminLayout : AlumniLayout;

    return (
        <>
            <Head title={title} />
            <Layout title={title}>{children}</Layout>
        </>
    );
}
