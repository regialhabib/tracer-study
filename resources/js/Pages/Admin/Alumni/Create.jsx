import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageHeader } from '@/Components/ui';
import AlumniForm from '@/Components/admin/alumni/AlumniForm';

export default function Create({ statusOptions }) {
    const form = useForm({
        name: '',
        nisn: '',
        email: '',
        gender: '',
        stambuk_number: '',
        birth_place: '',
        birth_date: '',
        phone_number: '',
        entry_year: '',
        graduation_year: '',
        major: '',
        pesantren_program: '',
        tahfidz_count: '',
        dormitory_complex: '',
        current_status: 'mencari_kerja',
        city: '',
        province: '',
        address: '',
    });

    const submit = (event) => {
        event.preventDefault();
        form.post(route('admin.alumni.store'));
    };

    return (
        <AdminLayout title="Tambah Alumni">
            <Head title="Tambah Alumni" />
            <div className="mx-auto max-w-3xl space-y-6">
                <PageHeader
                    title="Tambah Alumni"
                    description="Akun dibuat aktif. Kata sandi awal memakai tanggal lahir (ddmmyyyy), atau NISN bila tanggal lahir kosong."
                />
                <AlumniForm
                    form={form}
                    statusOptions={statusOptions}
                    onSubmit={submit}
                    submitLabel="Simpan Alumni"
                    cancelHref={route('admin.alumni.index')}
                />
            </div>
        </AdminLayout>
    );
}
