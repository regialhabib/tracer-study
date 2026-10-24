import { Link } from '@inertiajs/react';
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    FieldError,
    FieldHint,
    Input,
    Label,
    Select,
    Textarea,
} from '@/Components/ui';
import { GENDER_LABELS, toOptions } from '@/lib/labels';

function Field({ id, label, required, error, hint, children, className }) {
    return (
        <div className={`space-y-1.5 ${className ?? ''}`}>
            <Label htmlFor={id} required={required}>
                {label}
            </Label>
            {children}
            {hint && !error && <FieldHint>{hint}</FieldHint>}
            <FieldError message={error} />
        </div>
    );
}

/**
 * Formulir alumni bersama untuk Tambah dan Ubah. `form` adalah hasil `useForm`.
 */
export default function AlumniForm({ form, statusOptions, onSubmit, submitLabel, cancelHref }) {
    const { data, setData, errors, processing } = form;

    const text = (name) => ({
        id: name,
        name,
        value: data[name] ?? '',
        onChange: (event) => setData(name, event.target.value),
        invalid: Boolean(errors[name]),
    });

    return (
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
            <Card>
                <CardHeader>
                    <CardTitle>Data Akun</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <Field id="name" label="Nama lengkap" required error={errors.name} className="md:col-span-2">
                        <Input {...text('name')} autoComplete="off" />
                    </Field>
                    <Field id="nisn" label="NISN" required error={errors.nisn} hint="10 digit angka.">
                        <Input {...text('nisn')} inputMode="numeric" maxLength={10} className="font-mono" />
                    </Field>
                    <Field id="email" label="Email" error={errors.email} hint="Opsional.">
                        <Input {...text('email')} type="email" />
                    </Field>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Biodata</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <Field id="gender" label="Jenis kelamin" required error={errors.gender}>
                        <Select
                            id="gender"
                            value={data.gender}
                            onChange={(event) => setData('gender', event.target.value)}
                            invalid={Boolean(errors.gender)}
                            placeholder="Pilih jenis kelamin"
                        >
                            {toOptions(GENDER_LABELS).map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                    </Field>
                    <Field id="stambuk_number" label="Nomor stambuk" error={errors.stambuk_number}>
                        <Input {...text('stambuk_number')} />
                    </Field>
                    <Field id="birth_place" label="Tempat lahir" error={errors.birth_place}>
                        <Input {...text('birth_place')} />
                    </Field>
                    <Field id="birth_date" label="Tanggal lahir" error={errors.birth_date}>
                        <Input {...text('birth_date')} type="date" />
                    </Field>
                    <Field
                        id="phone_number"
                        label="Nomor WhatsApp"
                        error={errors.phone_number}
                        hint="Contoh: 081234567890"
                    >
                        <Input {...text('phone_number')} type="tel" inputMode="tel" />
                    </Field>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Data Pesantren</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <Field id="entry_year" label="Tahun masuk" required error={errors.entry_year}>
                        <Input {...text('entry_year')} type="number" inputMode="numeric" />
                    </Field>
                    <Field id="graduation_year" label="Tahun lulus" required error={errors.graduation_year}>
                        <Input {...text('graduation_year')} type="number" inputMode="numeric" />
                    </Field>
                    <Field id="major" label="Peminatan" required error={errors.major}>
                        <Input {...text('major')} />
                    </Field>
                    <Field id="pesantren_program" label="Program pesantren" error={errors.pesantren_program}>
                        <Input {...text('pesantren_program')} />
                    </Field>
                    <Field id="tahfidz_count" label="Jumlah juz tahfidz" error={errors.tahfidz_count}>
                        <Input {...text('tahfidz_count')} type="number" inputMode="numeric" min={0} max={30} />
                    </Field>
                    <Field id="dormitory_complex" label="Kompleks asrama" error={errors.dormitory_complex}>
                        <Input {...text('dormitory_complex')} />
                    </Field>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Kegiatan dan Domisili</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <Field
                        id="current_status"
                        label="Status kegiatan"
                        required
                        error={errors.current_status}
                        className="md:col-span-2"
                    >
                        <Select
                            id="current_status"
                            value={data.current_status}
                            onChange={(event) => setData('current_status', event.target.value)}
                            invalid={Boolean(errors.current_status)}
                            placeholder="Pilih status kegiatan"
                        >
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                    </Field>
                    <Field id="city" label="Kota/kabupaten" error={errors.city}>
                        <Input {...text('city')} />
                    </Field>
                    <Field id="province" label="Provinsi" error={errors.province}>
                        <Input {...text('province')} />
                    </Field>
                    <Field id="address" label="Alamat" error={errors.address} className="md:col-span-2">
                        <Textarea {...text('address')} rows={3} />
                    </Field>
                </CardContent>
            </Card>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button asChild variant="outline">
                    <Link href={cancelHref}>Batal</Link>
                </Button>
                <Button type="submit" loading={processing}>
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}
