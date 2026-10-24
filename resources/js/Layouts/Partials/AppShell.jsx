import { Toaster, useFlashToasts } from '@/Components/ui';

/**
 * AppShell — pembungkus tipis yang dipakai semua layout.
 *
 * Memasang `<Toaster />` dan mengubah flash dari server (`flash.status`, `flash.error`)
 * menjadi toast, sehingga setiap halaman otomatis menampilkan pesan flash.
 */
export default function AppShell({ children }) {
    useFlashToasts();

    return (
        <>
            {children}
            <Toaster />
        </>
    );
}
