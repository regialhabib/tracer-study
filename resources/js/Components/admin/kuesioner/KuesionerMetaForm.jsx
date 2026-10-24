import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { Button, FieldError, FieldHint, Input, Label, Textarea } from '@/Components/ui';

function parseYears(text) {
    return text
        .split(/[\s,;]+/)
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => Number(item))
        .filter((item) => Number.isInteger(item));
}

function firstError(errors, prefix) {
    const key = Object.keys(errors).find((name) => name === prefix || name.startsWith(`${prefix}.`));

    return key ? errors[key] : undefined;
}

/**
 * Form meta kuesioner (judul, deskripsi, periode, target angkatan).
 * `kuesioner` kosong = mode buat (POST); terisi = mode sunting (PUT).
 */
export default function KuesionerMetaForm({ kuesioner = null, cancelHref = null }) {
    const [yearsText, setYearsText] = useState((kuesioner?.target_graduation_years ?? []).join(', '));
    const form = useForm({
        title: kuesioner?.title ?? '',
        description: kuesioner?.description ?? '',
        start_date: kuesioner?.start_date ?? '',
        end_date: kuesioner?.end_date ?? '',
        target_graduation_years: [],
    });
    const { data, setData, errors, processing } = form;

    const submit = (event) => {
        event.preventDefault();
        form.transform((current) => ({ ...current, target_graduation_years: parseYears(yearsText) }));

        if (kuesioner) {
            form.put(route('admin.kuesioner.update', kuesioner.id), { preserveScroll: true });
        } else {
            form.post(route('admin.kuesioner.store'));
        }
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="title" required>
                    Judul Kuesioner
                </Label>
                <Input
                    id="title"
                    value={data.title}
                    invalid={Boolean(errors.title)}
                    onChange={(event) => setData('title', event.target.value)}
                />
                <FieldError message={errors.title} />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                    id="description"
                    rows={3}
                    value={data.description ?? ''}
                    invalid={Boolean(errors.description)}
                    onChange={(event) => setData('description', event.target.value)}
                />
                <FieldHint>Ditampilkan kepada alumni sebelum mulai mengisi.</FieldHint>
                <FieldError message={errors.description} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="start_date" required>
                        Tanggal Buka
                    </Label>
                    <Input
                        id="start_date"
                        type="date"
                        value={data.start_date}
                        invalid={Boolean(errors.start_date)}
                        onChange={(event) => setData('start_date', event.target.value)}
                    />
                    <FieldError message={errors.start_date} />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="end_date" required>
                        Tanggal Tutup
                    </Label>
                    <Input
                        id="end_date"
                        type="date"
                        value={data.end_date}
                        invalid={Boolean(errors.end_date)}
                        onChange={(event) => setData('end_date', event.target.value)}
                    />
                    <FieldError message={errors.end_date} />
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="target_graduation_years">Target Angkatan</Label>
                <Input
                    id="target_graduation_years"
                    inputMode="numeric"
                    placeholder="Contoh: 2022, 2023, 2024"
                    value={yearsText}
                    invalid={Boolean(firstError(errors, 'target_graduation_years'))}
                    aria-describedby="years-hint"
                    onChange={(event) => setYearsText(event.target.value)}
                />
                <FieldHint id="years-hint">Pisahkan tahun dengan koma. Kosongkan untuk menargetkan semua angkatan.</FieldHint>
                <FieldError message={firstError(errors, 'target_graduation_years')} />
            </div>

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                {cancelHref && (
                    <Button asChild variant="outline">
                        <Link href={cancelHref}>Batal</Link>
                    </Button>
                )}
                <Button type="submit" loading={processing} loadingText="Menyimpan…">
                    {kuesioner ? 'Simpan Pengaturan' : 'Buat Kuesioner'}
                </Button>
            </div>
        </form>
    );
}
