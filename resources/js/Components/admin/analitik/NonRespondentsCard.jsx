import { Download, PartyPopper } from 'lucide-react';
import WhatsAppLink from '@/Components/WhatsAppLink';
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    EmptyState,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui';
import { cleanFilters, formatNumber } from '@/lib/analitik';

/**
 * Kartu "Belum mengisi": tabel di desktop, kartu di mobile, tombol WhatsApp per baris.
 *
 * Props: `nonRespondents` { total, items: [{id,name,nisn,angkatan,phone_number,whatsapp_url}] }, `filters`.
 */
export default function NonRespondentsCard({ nonRespondents, filters }) {
    const items = nonRespondents?.items ?? [];
    const total = nonRespondents?.total ?? 0;
    const exportAvailable = route().has('admin.analitik.ekspor.belum-mengisi');

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <CardTitle>Belum mengisi</CardTitle>
                        <CardDescription>
                            <span className="tabular-nums">{formatNumber(total)}</span> alumni aktif belum mengirim jawaban.
                            {total > items.length && items.length > 0 && (
                                <span className="tabular-nums"> Menampilkan {formatNumber(items.length)} pertama.</span>
                            )}
                        </CardDescription>
                    </div>
                    {exportAvailable && total > 0 && (
                        <Button variant="outline" size="sm" asChild className="shrink-0">
                            <a href={route('admin.analitik.ekspor.belum-mengisi', cleanFilters(filters))}>
                                <Download aria-hidden="true" />
                                Unduh daftar
                            </a>
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {items.length === 0 ? (
                    <EmptyState
                        icon={PartyPopper}
                        title="Semua alumni sudah mengisi"
                        description="Tidak ada alumni aktif yang perlu diingatkan untuk filter ini."
                        className="py-6"
                    />
                ) : (
                    <>
                        <Table containerClassName="hidden rounded-md border border-border md:block">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>NISN</TableHead>
                                    <TableHead>Angkatan</TableHead>
                                    <TableHead>Pengingat</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-semibold">{item.name}</TableCell>
                                        <TableCell className="font-mono text-[13px] text-muted-foreground">
                                            {item.nisn || '–'}
                                        </TableCell>
                                        <TableCell className="tabular-nums">{item.angkatan || '–'}</TableCell>
                                        <TableCell>
                                            <WhatsAppLink href={item.whatsapp_url} size="sm">
                                                Ingatkan
                                            </WhatsAppLink>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <ul className="flex flex-col gap-3 md:hidden">
                            {items.map((item) => (
                                <li key={item.id} className="flex flex-col gap-3 rounded-md border border-border p-4">
                                    <div>
                                        <p className="font-semibold text-foreground">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            <span className="font-mono">{item.nisn || '–'}</span>
                                            <span className="tabular-nums"> · Angkatan {item.angkatan || '–'}</span>
                                        </p>
                                    </div>
                                    <WhatsAppLink href={item.whatsapp_url} className="w-full">
                                        Ingatkan via WhatsApp
                                    </WhatsAppLink>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
