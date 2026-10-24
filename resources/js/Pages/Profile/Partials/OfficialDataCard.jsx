import { Card, CardContent, CardDescription, CardHeader } from '@/Components/ui';
import { GENDER_LABELS, labelFor } from '@/lib/labels';

function DataRow({ label, children, mono = false }) {
    return (
        <div className="space-y-0.5">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className={`text-base font-medium text-foreground ${mono ? 'font-mono' : ''}`}>
                {children || '-'}
            </dd>
        </div>
    );
}

export default function OfficialDataCard({ alumni, className = '' }) {
    return (
        <section aria-labelledby="official-data-title" className={className}>
            <Card>
                <CardHeader>
                    <h2
                        id="official-data-title"
                        className="text-lg font-semibold leading-snug tracking-tight text-foreground"
                    >
                        Data Resmi
                    </h2>
                    <CardDescription>
                        Data ini bersumber dari pesantren dan tidak dapat diubah sendiri. Hubungi admin bila
                        ada kesalahan data.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <dl className="grid gap-4 sm:grid-cols-2">
                        <DataRow label="NISN" mono>
                            {alumni.nisn}
                        </DataRow>
                        <DataRow label="Nama lengkap">{alumni.name}</DataRow>
                        <DataRow label="Jenis kelamin">{labelFor(GENDER_LABELS, alumni.gender, '')}</DataRow>
                        <DataRow label="Tahun masuk">{alumni.entry_year}</DataRow>
                        <DataRow label="Tahun lulus">{alumni.graduation_year}</DataRow>
                        <DataRow label="Peminatan">{alumni.major}</DataRow>
                        <DataRow label="Program pesantren">{alumni.pesantren_program}</DataRow>
                    </dl>
                </CardContent>
            </Card>
        </section>
    );
}
