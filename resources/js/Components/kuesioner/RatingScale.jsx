import { RadioCard, RadioCardGroup } from '@/Components/ui';

const SCALE = [1, 2, 3, 4, 5];

/**
 * Skala penilaian 1–5.
 * @param {{value?: number|null, onChange: (value: number) => void, disabled?: boolean, name?: string, invalid?: boolean}} props
 */
export default function RatingScale({ value = null, onChange, disabled = false, name = 'rating', invalid = false, ...rest }) {
    return (
        <div className="space-y-1.5">
            <RadioCardGroup
                name={name}
                value={value === null || value === undefined ? '' : String(value)}
                onValueChange={(next) => onChange?.(Number(next))}
                disabled={disabled}
                invalid={invalid}
                className="grid-cols-5 gap-1.5 sm:gap-2"
                {...rest}
            >
                {SCALE.map((point) => (
                    <RadioCard key={point} value={String(point)} hideIndicator className="px-0 py-0 font-semibold tabular-nums">
                        {point}
                    </RadioCard>
                ))}
            </RadioCardGroup>
            <div className="flex justify-between text-xs text-muted-foreground" aria-hidden="true">
                <span>Sangat rendah</span>
                <span>Sangat tinggi</span>
            </div>
        </div>
    );
}
