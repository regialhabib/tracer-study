import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageHeader } from '@/Components/ui';
import AlumniForm from '@/Components/admin/alumni/AlumniForm';

const FIELDS = [
    'name',
    'nisn',
    'email',
    'gender',
    'stambuk_number',
    'birth_place',
    'birth_date',
    'phone_number',
    'entry_year',
    'graduation_year',
    'major',
    'pesantren_program',
    'tahfidz_count',
    'dormitory_complex',
    'current_status',
    'city',
    'province',
    'address',
];

export default function Edit({ alumni, statusOptions }) {
    const form = useForm(Object.fromEntries(FIELDS.map((field) => [field, alumni[field] ?? ''])));

    const submit = (event) => {
        event.preventDefault();
        form.put(route('admin.alumni.update', alumni.id));
    };

    return (
        <AdminLayout title="Ubah Data Alumni">
            <Head title={`Ubah ${alumni.name}`} />
            <div className="mx-auto max-w-3xl space-y-6">
                <PageHeader title="Ubah Data Alumni" description={alumni.name} />
                <AlumniForm
                    form={form}
                    statusOptions={statusOptions}
                    onSubmit={submit}
                    submitLabel="Simpan Perubahan"
                    cancelHref={route('admin.alumni.show', alumni.id)}
                />
            </div>
        </AdminLayout>
    );
}
