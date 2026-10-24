import { Link } from '@inertiajs/react';
import { Button, Card, CardContent, CardHeader, CardTitle, FieldError, FieldHint, Input, Label, Select } from '@/Components/ui';
import RichTextEditor from '@/Components/berita/RichTextEditor';
import CoverField from '@/Components/admin/berita/CoverField';

function Field({ id, label, required, error, hint, children, className }) {
    return (
        <div className={`space-y-1.5 ${className ?? ''}`}>
            <Label htmlFor={id} required={required}>
                {label}
            </Label>
            {children}
            {hint && !error && <FieldHint>{hint}</FieldHint>}
            <FieldError id={`${id}-error`} message={error} />
        </div>
    );
}

/**
 * Formulir berita bersama untuk Tambah dan Ubah. `form` adalah hasil `useForm`
 * dengan field: type, title, content, thumbnail, remove_thumbnail, status, published_at,
 * event_date, location, registration_link.
 */
export default function BeritaForm({ form, options, currentThumbnail, onSubmit, submitLabel, cancelHref }) {
    const { data, setData, errors, processing } = form;
    const isAgenda = data.type === 'agenda';

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
                    <CardTitle>Isi Konten</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Field id="type" label="Tipe" required error={errors.type}>
                        <Select
                            id="type"
                            value={data.type}
                            onChange={(event) => setData('type', event.target.value)}
                            invalid={Boolean(errors.type)}
                        >
                            {options.types.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                    </Field>
                    <Field id="title" label="Judul" required error={errors.title}>
                        <Input {...text('title')} maxLength={200} autoComplete="off" />
                    </Field>
                    <div className="space-y-1.5">
                        <Label htmlFor="content" required>
                            Isi
                        </Label>
                        <RichTextEditor
                            id="content"
                            value={data.content}
                            onChange={(html) => setData('content', html)}
                            placeholder="Tulis isi berita…"
                            invalid={Boolean(errors.content)}
                            aria-describedby="content-error"
                        />
                        <FieldError id="content-error" message={errors.content} />
                    </div>
                    <CoverField
                        file={data.thumbnail}
                        currentSrc={currentThumbnail}
                        removed={Boolean(data.remove_thumbnail)}
                        onFileChange={(file) => setData('thumbnail', file)}
                        onRemovedChange={(removed) => setData('remove_thumbnail', removed)}
                        error={errors.thumbnail}
                    />
                </CardContent>
            </Card>

            {isAgenda && (
                <Card>
                    <CardHeader>
                        <CardTitle>Detail Agenda</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <Field id="event_date" label="Tanggal dan jam acara" required error={errors.event_date}>
                            <Input {...text('event_date')} type="datetime-local" />
                        </Field>
                        <Field id="location" label="Lokasi" required error={errors.location}>
                            <Input {...text('location')} maxLength={255} />
                        </Field>
                        <Field
                            id="registration_link"
                            label="Tautan pendaftaran"
                            required
                            error={errors.registration_link}
                            className="md:col-span-2"
                        >
                            <Input {...text('registration_link')} type="url" inputMode="url" placeholder="https://" />
                        </Field>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Penerbitan</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <Field id="status" label="Status" required error={errors.status}>
                        <Select
                            id="status"
                            value={data.status}
                            onChange={(event) => setData('status', event.target.value)}
                            invalid={Boolean(errors.status)}
                        >
                            {options.statuses.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                    </Field>
                    {data.status === 'published' && (
                        <Field
                            id="published_at"
                            label="Jadwal terbit"
                            error={errors.published_at}
                            hint="Kosongkan untuk terbit sekarang. Isi dengan waktu mendatang untuk menjadwalkan."
                        >
                            <Input {...text('published_at')} type="datetime-local" />
                        </Field>
                    )}
                </CardContent>
            </Card>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button asChild variant="outline">
                    <Link href={cancelHref}>Batal</Link>
                </Button>
                <Button type="submit" loading={processing} loadingText="Menyimpan…">
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}
