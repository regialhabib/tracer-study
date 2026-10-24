import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageHeader } from '@/Components/ui';
import BeritaForm from '@/Components/admin/berita/BeritaForm';

export default function Create({ options }) {
    const form = useForm({
        type: 'berita',
        title: '',
        content: '',
        thumbnail: null,
        remove_thumbnail: false,
        status: 'draft',
        published_at: '',
        event_date: '',
        location: '',
        registration_link: '',
    });

    const submit = (event) => {
        event.preventDefault();
        form.post(route('admin.berita.store'), { forceFormData: true });
    };

    return (
        <AdminLayout title="Tambah Berita">
            <Head title="Tambah Berita" />
            <div className="mx-auto max-w-3xl space-y-6">
                <PageHeader title="Tambah Berita" description="Tulis berita, agenda, pengumuman, atau info beasiswa untuk alumni." />
                <BeritaForm
                    form={form}
                    options={options}
                    currentThumbnail={null}
                    onSubmit={submit}
                    submitLabel="Simpan Berita"
                    cancelHref={route('admin.berita.index')}
                />
            </div>
        </AdminLayout>
    );
}
