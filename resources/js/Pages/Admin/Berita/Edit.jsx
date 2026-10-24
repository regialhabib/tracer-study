import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageHeader } from '@/Components/ui';
import BeritaForm from '@/Components/admin/berita/BeritaForm';

export default function Edit({ berita, options }) {
    const form = useForm({
        _method: 'put',
        type: berita.type,
        title: berita.title,
        content: berita.content ?? '',
        thumbnail: null,
        remove_thumbnail: false,
        status: berita.status,
        published_at: berita.published_at ?? '',
        event_date: berita.event_date ?? '',
        location: berita.location ?? '',
        registration_link: berita.registration_link ?? '',
    });

    const submit = (event) => {
        event.preventDefault();
        form.post(route('admin.berita.update', berita.id), { forceFormData: true });
    };

    return (
        <AdminLayout title="Ubah Berita">
            <Head title={`Ubah ${berita.title}`} />
            <div className="mx-auto max-w-3xl space-y-6">
                <PageHeader title="Ubah Berita" description={berita.title} />
                <BeritaForm
                    form={form}
                    options={options}
                    currentThumbnail={berita.thumbnail_src}
                    onSubmit={submit}
                    submitLabel="Simpan Perubahan"
                    cancelHref={route('admin.berita.index')}
                />
            </div>
        </AdminLayout>
    );
}
