import { Head, Link, router, usePage } from '@inertiajs/react';
import { BellOff, CheckCheck } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import AlumniLayout from '@/Layouts/AlumniLayout';
import NotificationItem from '@/Components/notifikasi/NotificationItem';
import { Button, Card, EmptyState, PageHeader, Pagination } from '@/Components/ui';
import { cn } from '@/lib/utils';

export default function Index({ notifications }) {
    const { auth, notifikasi } = usePage().props;
    const Layout = auth?.user?.role === 'admin' ? AdminLayout : AlumniLayout;
    const unread = notifikasi?.unread ?? 0;
    const items = notifications.data;

    const markAllAsRead = () => router.post(route('notifikasi.read-all'), {}, { preserveScroll: true });

    return (
        <Layout title="Notifikasi">
            <Head title="Notifikasi" />

            <div className="mx-auto max-w-3xl space-y-6">
                <PageHeader
                    title="Notifikasi"
                    description={unread > 0 ? `${unread} notifikasi belum dibaca.` : 'Semua notifikasi sudah dibaca.'}
                    actions={
                        unread > 0 && (
                            <Button variant="outline" onClick={markAllAsRead}>
                                <CheckCheck aria-hidden="true" />
                                Tandai Semua Dibaca
                            </Button>
                        )
                    }
                />

                {items.length === 0 ? (
                    <Card>
                        <EmptyState
                            icon={BellOff}
                            title="Belum ada notifikasi"
                            description="Kabar penting seperti kuesioner baru dan pengingat tenggat akan muncul di sini."
                        />
                    </Card>
                ) : (
                    <Card className="overflow-hidden">
                        <ul className="divide-y divide-border">
                            {items.map((item) => (
                                <li key={item.id}>
                                    <Link
                                        href={route('notifikasi.read', item.id)}
                                        method="post"
                                        as="button"
                                        type="button"
                                        className={cn(
                                            'block w-full p-4 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                                            !item.read_at && 'bg-primary-soft/40',
                                        )}
                                    >
                                        <NotificationItem item={item} />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Card>
                )}

                <Pagination links={notifications.links} label="Navigasi halaman notifikasi" />
            </div>
        </Layout>
    );
}
