import { CheckboxCard, FieldError, FieldHint, Input, Label, RadioCard, RadioCardGroup, Select, Textarea, labelVariants } from '@/Components/ui';
import { cn } from '@/lib/utils';
import RatingScale from './RatingScale';

const GROUP_TYPES = ['radio', 'checkbox', 'rating'];

function RequiredMark() {
    return (
        <>
            <span aria-hidden="true" className="ml-0.5 text-danger">
                *
            </span>
            <span className="sr-only"> (wajib)</span>
        </>
    );
}

/**
 * Menampilkan satu pertanyaan beserta kontrolnya.
 * `value` bertipe sesuai kontrak: string | string[] | number.
 * @param {{question: object, value: any, onChange: (value: any) => void, error?: string, disabled?: boolean}} props
 */
export default function QuestionRenderer({ question, value, onChange, error, disabled = false }) {
    const id = `q-${question.id}`;
    const labelId = `${id}-label`;
    const helpId = question.help_text ? `${id}-help` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;
    const type = question.question_type;
    const isGroup = GROUP_TYPES.includes(type);
    const invalid = Boolean(error);
    const options = question.options ?? [];

    const common = { id, disabled, invalid, 'aria-describedby': describedBy };
    const groupProps = { 'aria-labelledby': labelId, 'aria-describedby': describedBy };

    let control = null;

    if (type === 'text') {
        control = <Input {...common} type="text" maxLength={255} value={value ?? ''} onChange={(event) => onChange(event.target.value)} />;
    } else if (type === 'textarea') {
        control = <Textarea {...common} rows={4} maxLength={5000} value={value ?? ''} onChange={(event) => onChange(event.target.value)} />;
    } else if (type === 'number') {
        control = (
            <Input
                {...common}
                type="number"
                inputMode="decimal"
                min={0}
                max={1000000}
                step="any"
                value={value ?? ''}
                onChange={(event) => {
                    const raw = event.target.value;
                    onChange(raw === '' || !Number.isFinite(Number(raw)) ? '' : Number(raw));
                }}
            />
        );
    } else if (type === 'date') {
        control = <Input {...common} type="date" value={value ?? ''} onChange={(event) => onChange(event.target.value)} />;
    } else if (type === 'select') {
        control = (
            <Select {...common} placeholder="Pilih salah satu" value={value ?? ''} onChange={(event) => onChange(event.target.value)}>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </Select>
        );
    } else if (type === 'radio') {
        control = (
            <RadioCardGroup
                id={id}
                name={id}
                value={value === null || value === undefined ? '' : String(value)}
                onValueChange={onChange}
                disabled={disabled}
                invalid={invalid}
                {...groupProps}
            >
                {options.map((option) => (
                    <RadioCard key={option.value} value={String(option.value)}>
                        {option.label}
                    </RadioCard>
                ))}
            </RadioCardGroup>
        );
    } else if (type === 'checkbox') {
        const selected = Array.isArray(value) ? value.map(String) : [];
        const toggle = (optionValue, checked) => {
            const next = checked ? [...selected, String(optionValue)] : selected.filter((item) => item !== String(optionValue));

            onChange(options.map((option) => String(option.value)).filter((item) => next.includes(item)));
        };

        control = (
            <div id={id} role="group" className="grid gap-2" {...groupProps}>
                {options.map((option) => (
                    <CheckboxCard
                        key={option.value}
                        name={id}
                        value={String(option.value)}
                        checked={selected.includes(String(option.value))}
                        onCheckedChange={(checked) => toggle(option.value, checked)}
                        disabled={disabled}
                        invalid={invalid}
                    >
                        {option.label}
                    </CheckboxCard>
                ))}
            </div>
        );
    } else if (type === 'rating') {
        control = (
            <div id={id}>
                <RatingScale name={id} value={value === '' ? null : value} onChange={onChange} disabled={disabled} invalid={invalid} {...groupProps} />
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="space-y-1">
                {isGroup ? (
                    <p id={labelId} className={cn(labelVariants(), 'block text-base')}>
                        {question.question_text}
                        {question.is_required && <RequiredMark />}
                    </p>
                ) : (
                    <Label id={labelId} htmlFor={id} className="block text-base">
                        {question.question_text}
                        {question.is_required && <RequiredMark />}
                    </Label>
                )}
                {question.help_text && <FieldHint id={helpId}>{question.help_text}</FieldHint>}
            </div>
            {control}
            <FieldError id={errorId} message={error} />
        </div>
    );
}
