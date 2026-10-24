import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button, Card, CardContent, FieldError, Input, Label, PageHeader } from '@/Components/ui';

export default function Edit({ adminUser }) {
    const { data, setData, put, processing, errors } = useForm({
        name: adminUser.name,
        email: adminUser.email ?? '',
    });

    const submit = (event) => {
        event.preventDefault();
        put(route('admin.pengguna.update', adminUser.id));
    };

    return (
        <AdminLayout title="Ubah Data Admin">
            <Head title="Ubah Data Admin" />

            <div className="flex max-w-xl flex-col gap-6">
                <PageHeader title="Ubah Data Admin" description={`Perbarui nama dan email ${adminUser.name}.`} />

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={submit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="name" required>
                                    Nama Lengkap
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    invalid={Boolean(errors.name)}
                                    onChange={(event) => setData('name', event.target.value)}
                                />
                                <FieldError message={errors.name} />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="email" required>
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    invalid={Boolean(errors.email)}
                                    onChange={(event) => setData('email', event.target.value)}
                                />
                                <FieldError message={errors.email} />
                            </div>

                            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                                <Button asChild variant="outline">
                                    <Link href={route('admin.pengguna.index')}>Batal</Link>
                                </Button>
                                <Button type="submit" loading={processing} loadingText="Menyimpan…">
                                    Simpan Perubahan
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
