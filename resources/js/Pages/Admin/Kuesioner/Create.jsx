import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, PageHeader } from '@/Components/ui';
import KuesionerMetaForm from '@/Components/admin/kuesioner/KuesionerMetaForm';

export default function Create() {
    return (
        <AdminLayout title="Buat Kuesioner">
            <Head title="Buat Kuesioner" />

            <div className="flex max-w-2xl flex-col gap-6">
                <PageHeader
                    title="Buat Kuesioner"
                    description="Kuesioner baru dibuat sebagai draf. Anda dapat menambahkan pertanyaan di langkah berikutnya."
                />

                <Card>
                    <CardContent className="pt-6">
                        <KuesionerMetaForm cancelHref={route('admin.kuesioner.index')} />
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
