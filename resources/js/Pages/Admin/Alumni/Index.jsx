import { Head, Link } from '@inertiajs/react';
import { Download, FileUp, Plus, SearchX, Users } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Button,
    Card,
    CardContent,
    EmptyState,
    PageHeader,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui';
import AlumniFilters from '@/Components/admin/alumni/AlumniFilters';
import { AccountStatusBadge, ActivityStatusBadge } from '@/Components/admin/alumni/AlumniBadges';
import { initialsFromName } from '@/Layouts/Partials/navigation';

const numberFormatter = new Intl.NumberFormat('id-ID');

function NameCell({ alumni }) {
    return (
        <div className="flex min-w-0 items-center gap-3">
            <Avatar>
                <AvatarImage src={alumni.avatar_url} alt="" />
                <AvatarFallback>{initialsFromName(alumni.name)}</AvatarFallback>
            </Avatar>
            <Link
                href={route('admin.alumni.show', alumni.id)}
                className="min-w-0 truncate font-medium text-foreground hover:text-primary hover:underline"
            >
                {alumni.name}
            </Link>
        </div>
    );
}

export default function Index({ alumni, filters, filterOptions }) {
    const hasFilters = Object.keys(filters ?? {}).length > 0;
    const canImport = route().has('admin.alumni.import.create');
    const exportUrl = route('admin.alumni.export', filters ?? {});

    const actions = (
        <>
            {canImport && (
                <Button asChild variant="outline">
                    <Link href={route('admin.alumni.import.create')}>
                        <FileUp aria-hidden="true" />
                        Import Excel
                    </Link>
                </Button>
            )}
            <Button asChild variant="outline">
                <a href={exportUrl}>
                    <Download aria-hidden="true" />
                    Ekspor Excel
                </a>
            </Button>
            <Button asChild>
                <Link href={route('admin.alumni.create')}>
                    <Plus aria-hidden="true" />
                    Tambah Alumni
                </Link>
            </Button>
        </>
    );

    return (
        <AdminLayout title="Data Alumni">
            <Head title="Data Alumni" />
            <div className="space-y-6">
                <PageHeader
                    title="Data Alumni"
                    description={`${numberFormatter.format(alumni.total)} alumni ${hasFilters ? 'sesuai filter' : 'terdaftar'}.`}
                    actions={actions}
                />

                <Card>
                    <CardContent className="space-y-5 p-4 sm:p-5">
                        <AlumniFilters filters={filters ?? {}} options={filterOptions} />

                        {alumni.data.length === 0 ? (
                            <EmptyState
                                icon={hasFilters ? SearchX : Users}
                                title={hasFilters ? 'Tidak ada alumni yang cocok' : 'Belum ada alumni'}
                                description={
                                    hasFilters
                                        ? 'Ubah kata kunci atau atur ulang filter.'
                                        : 'Tambahkan alumni secara manual atau import dari berkas Excel.'
                                }
                            />
                        ) : (
                            <>
                                <div className="hidden md:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nama</TableHead>
                                                <TableHead>NISN</TableHead>
                                                <TableHead>Angkatan</TableHead>
                                                <TableHead>Peminatan</TableHead>
                                                <TableHead>Status Kegiatan</TableHead>
                                                <TableHead>Status Akun</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {alumni.data.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="max-w-[260px]">
                                                        <NameCell alumni={item} />
                                                    </TableCell>
                                                    <TableCell className="font-mono text-sm">{item.nisn ?? '-'}</TableCell>
                                                    <TableCell>{item.graduation_year ?? '-'}</TableCell>
                                                    <TableCell>{item.major ?? '-'}</TableCell>
                                                    <TableCell>
                                                        <ActivityStatusBadge status={item.current_status} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <AccountStatusBadge
                                                            status={item.status}
                                                            deleted={Boolean(item.deleted_at)}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <ul className="space-y-3 md:hidden">
                                    {alumni.data.map((item) => (
                                        <li key={item.id} className="space-y-3 rounded-lg border border-border bg-card p-4">
                                            <NameCell alumni={item} />
                                            <p className="text-sm text-muted-foreground">
                                                <span className="font-mono">{item.nisn ?? '-'}</span>
                                                {' · '}Angkatan {item.graduation_year ?? '-'}
                                                {item.major ? ` · ${item.major}` : ''}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                <ActivityStatusBadge status={item.current_status} />
                                                <AccountStatusBadge
                                                    status={item.status}
                                                    deleted={Boolean(item.deleted_at)}
                                                />
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                <Pagination links={alumni.links} />
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
