import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button, Card, CardContent, FieldError, FieldHint, Input, Label, PageHeader } from '@/Components/ui';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post(route('admin.pengguna.store'));
    };

    return (
        <AdminLayout title="Tambah Admin">
            <Head title="Tambah Admin" />

            <div className="flex max-w-xl flex-col gap-6">
                <PageHeader
                    title="Tambah Admin"
                    description="Admin baru akan diminta mengganti kata sandi saat masuk pertama kali."
                />

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
                                    autoComplete="off"
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
                                    autoComplete="off"
                                    invalid={Boolean(errors.email)}
                                    onChange={(event) => setData('email', event.target.value)}
                                />
                                <FieldError message={errors.email} />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="password" required>
                                    Kata Sandi Awal
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    autoComplete="new-password"
                                    invalid={Boolean(errors.password)}
                                    aria-describedby="password-hint"
                                    onChange={(event) => setData('password', event.target.value)}
                                />
                                <FieldHint id="password-hint">
                                    Sampaikan kata sandi ini secara langsung. Minimal 8 karakter.
                                </FieldHint>
                                <FieldError message={errors.password} />
                            </div>

                            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                                <Button asChild variant="outline">
                                    <Link href={route('admin.pengguna.index')}>Batal</Link>
                                </Button>
                                <Button type="submit" loading={processing} loadingText="Menyimpan…">
                                    Tambah Admin
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
