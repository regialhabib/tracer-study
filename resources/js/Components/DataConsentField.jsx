import { Checkbox, FieldError } from '@/Components/ui';

/**
 * DataConsentField — centang persetujuan penggunaan data (UU PDP) + rincian "Baca selengkapnya".
 *
 * Teks berasal dari `config('tracer.consent_text')` (prop `consent`: { label, summary, points[] }).
 *
 * Props:
 * - `consent`  objek teks persetujuan dari server.
 * - `checked`  nilai centang.
 * - `onChange` dipanggil dengan boolean saat centang berubah.
 * - `error`    pesan error validasi `data_consent`.
 */
export default function DataConsentField({ consent, checked, onChange, error }) {
    if (!consent) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Persetujuan Penggunaan Data</p>
                <p className="leading-relaxed">{consent.summary}</p>

                <details className="group">
                    <summary className="cursor-pointer rounded-sm font-semibold text-brand-blue underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <span className="group-open:hidden">Baca selengkapnya</span>
                        <span className="hidden group-open:inline">Sembunyikan rincian</span>
                    </summary>
                    <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 leading-relaxed">
                        {consent.points.map((point) => (
                            <li key={point}>{point}</li>
                        ))}
                    </ul>
                </details>
            </div>

            <Checkbox
                id="data_consent"
                name="data_consent"
                checked={checked}
                invalid={Boolean(error)}
                aria-describedby={error ? 'data_consent-error' : undefined}
                label={consent.label}
                onCheckedChange={onChange}
                required
            />
            <FieldError id="data_consent-error" message={error} />
        </div>
    );
}
