import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Trash2, Undo2 } from 'lucide-react';
import { Button, FieldError, FieldHint, Label } from '@/Components/ui';

const MAX_SIZE = 2 * 1024 * 1024;

/**
 * Kolom gambar sampul dengan pratinjau.
 *
 * Props: `file` (File baru|null), `currentSrc` (sampul tersimpan), `removed` (bool),
 * `onFileChange(file|null)`, `onRemovedChange(bool)`, `error`.
 */
export default function CoverField({ file, currentSrc, removed, onFileChange, onRemovedChange, error }) {
    const inputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [localError, setLocalError] = useState(null);

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return undefined;
        }

        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [file]);

    const handleChange = (event) => {
        const selected = event.target.files?.[0] ?? null;
        event.target.value = '';

        if (!selected) {
            return;
        }

        if (selected.size > MAX_SIZE) {
            setLocalError('Ukuran gambar sampul maksimal 2 MB.');
            return;
        }

        setLocalError(null);
        onRemovedChange(false);
        onFileChange(selected);
    };

    const shownSrc = previewUrl ?? (removed ? null : currentSrc);
    const message = localError ?? error;

    return (
        <div className="space-y-2">
            <Label htmlFor="thumbnail">Gambar sampul</Label>

            {shownSrc ? (
                <img
                    src={shownSrc}
                    alt="Pratinjau gambar sampul"
                    className="aspect-video w-full max-w-md rounded-md border border-border object-cover"
                />
            ) : (
                <div className="flex aspect-video w-full max-w-md items-center justify-center rounded-md border border-dashed border-border bg-muted text-sm text-muted-foreground">
                    Belum ada gambar sampul
                </div>
            )}

            <input
                ref={inputRef}
                id="thumbnail"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handleChange}
                aria-describedby="thumbnail-hint thumbnail-error"
            />

            <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
                    <ImagePlus aria-hidden="true" />
                    {shownSrc ? 'Ganti Gambar' : 'Pilih Gambar'}
                </Button>
                {file && (
                    <Button type="button" variant="ghost" onClick={() => onFileChange(null)}>
                        <Undo2 aria-hidden="true" />
                        Batalkan Pilihan
                    </Button>
                )}
                {!file && currentSrc && !removed && (
                    <Button type="button" variant="ghost" onClick={() => onRemovedChange(true)}>
                        <Trash2 aria-hidden="true" />
                        Hapus Sampul
                    </Button>
                )}
                {!file && removed && (
                    <Button type="button" variant="ghost" onClick={() => onRemovedChange(false)}>
                        <Undo2 aria-hidden="true" />
                        Batalkan Penghapusan
                    </Button>
                )}
            </div>

            <FieldHint id="thumbnail-hint">Format JPG, PNG, atau WebP, maksimal 2 MB. Otomatis diubah ke WebP.</FieldHint>
            <FieldError id="thumbnail-error" message={message} />
        </div>
    );
}
