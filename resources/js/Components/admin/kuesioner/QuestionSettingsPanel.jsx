import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Plus, Trash2, X } from 'lucide-react';
import {
    Button,
    Checkbox,
    Dialog,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    FieldError,
    FieldHint,
    Input,
    Label,
    Select,
    Textarea,
} from '@/Components/ui';
import { hasOptions } from '@/lib/kuesioner';

const EMPTY_OPTIONS = [
    { value: '', label: '' },
    { value: '', label: '' },
];

function errorFor(errors, prefix) {
    const key = Object.keys(errors).find((name) => name === prefix || name.startsWith(`${prefix}.`));

    return key ? errors[key] : undefined;
}

/**
 * Panel pengaturan satu pertanyaan (tambah atau sunting).
 * `question` null = pertanyaan baru pada `section`. `earlierQuestions` = pertanyaan yang berada sebelumnya
 * (kandidat acuan logika kondisional).
 */
export default function QuestionSettingsPanel({
    kuesionerId,
    question,
    section,
    earlierQuestions,
    usedMetricKeys,
    isLocked,
    questionTypes,
    metricKeys,
    onClose,
}) {
    const isNew = question === null;
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const rule = question?.conditional_rule ?? null;

    const form = useForm({
        ...(isNew ? { section } : {}),
        question_text: question?.question_text ?? '',
        help_text: question?.help_text ?? '',
        question_type: question?.question_type ?? 'text',
        is_required: question?.is_required ?? true,
        options: question?.options?.length ? question.options.map((option) => ({ ...option })) : EMPTY_OPTIONS.map((option) => ({ ...option })),
        metric_key: question?.metric_key ?? '',
        conditional_rule: rule
            ? { depends_on: String(rule.depends_on), operator: rule.operator, value: rule.value }
            : { depends_on: '', operator: 'equals', value: '' },
    });
    const { data, setData, errors, processing } = form;
    const [ruleEnabled, setRuleEnabled] = useState(rule !== null);

    const metric = metricKeys.find((item) => item.value === data.metric_key) ?? null;
    const presetLocked = Boolean(metric?.preset_options);
    const structureDisabled = isLocked;
    const optionsDisabled = isLocked || presetLocked;
    const referenceCandidates = earlierQuestions.filter((item) => hasOptions(item.question_type));
    const reference = referenceCandidates.find((item) => String(item.id) === String(data.conditional_rule.depends_on)) ?? null;
    const structureError = errors.struktur;

    const changeType = (type) => {
        setData((current) => {
            const next = { ...current, question_type: type };

            if (current.metric_key && metricKeys.find((item) => item.value === current.metric_key)?.question_type !== type) {
                next.metric_key = '';
            }

            return next;
        });
    };

    const changeMetric = (value) => {
        const selected = metricKeys.find((item) => item.value === value);

        setData((current) => ({
            ...current,
            metric_key: value,
            question_type: selected ? selected.question_type : current.question_type,
            options: selected?.preset_options ? selected.preset_options.map((option) => ({ ...option })) : current.options,
        }));
    };

    const updateOption = (index, label) => {
        setData(
            'options',
            data.options.map((option, position) => (position === index ? { ...option, label } : option)),
        );
    };

    const toggleRuleValue = (value) => {
        const current = [].concat(data.conditional_rule.value || []);
        const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];

        setData('conditional_rule', { ...data.conditional_rule, value: next });
    };

    const submit = (event) => {
        event.preventDefault();

        form.transform((current) => ({
            ...current,
            options: hasOptions(current.question_type) ? current.options : null,
            metric_key: current.metric_key || null,
            help_text: current.help_text || null,
            conditional_rule:
                ruleEnabled && current.conditional_rule.depends_on
                    ? { ...current.conditional_rule, depends_on: Number(current.conditional_rule.depends_on) }
                    : null,
        }));

        if (isNew) {
            form.post(route('admin.kuesioner.pertanyaan.store', kuesionerId), { preserveScroll: true });
        } else {
            form.put(route('admin.kuesioner.pertanyaan.update', [kuesionerId, question.id]), { preserveScroll: true });
        }
    };

    const remove = () => {
        form.delete(route('admin.kuesioner.pertanyaan.destroy', [kuesionerId, question.id]), {
            preserveScroll: true,
            onStart: () => setDeleting(true),
            onFinish: () => {
                setDeleting(false);
                setConfirmingDelete(false);
            },
            onSuccess: onClose,
        });
    };

    const idPrefix = isNew ? 'new' : `q${question.id}`;

    return (
        <form onSubmit={submit} className="flex flex-col gap-4" aria-label={isNew ? 'Pertanyaan baru' : 'Pengaturan pertanyaan'}>
            <h3 className="text-base font-semibold text-foreground">{isNew ? `Pertanyaan Baru di "${section}"` : 'Pengaturan Pertanyaan'}</h3>

            <FieldError message={structureError ?? errors.destroy} />

            <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${idPrefix}-text`} required>
                    Teks Pertanyaan
                </Label>
                <Textarea
                    id={`${idPrefix}-text`}
                    rows={2}
                    value={data.question_text}
                    invalid={Boolean(errors.question_text)}
                    onChange={(event) => setData('question_text', event.target.value)}
                />
                <FieldError message={errors.question_text} />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${idPrefix}-help`}>Teks Bantuan</Label>
                <Input
                    id={`${idPrefix}-help`}
                    value={data.help_text ?? ''}
                    invalid={Boolean(errors.help_text)}
                    onChange={(event) => setData('help_text', event.target.value)}
                />
                <FieldHint>Penjelasan singkat di bawah pertanyaan (opsional).</FieldHint>
                <FieldError message={errors.help_text} />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${idPrefix}-type`} required>
                    Tipe Pertanyaan
                </Label>
                <Select
                    id={`${idPrefix}-type`}
                    value={data.question_type}
                    disabled={structureDisabled}
                    invalid={Boolean(errors.question_type)}
                    onChange={(event) => changeType(event.target.value)}
                >
                    {questionTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </Select>
                <FieldError message={errors.question_type} />
            </div>

            <Checkbox
                label="Wajib diisi"
                checked={data.is_required}
                disabled={structureDisabled}
                onCheckedChange={(checked) => setData('is_required', checked)}
            />

            <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${idPrefix}-metric`}>Kunci Metrik Analitik</Label>
                <Select
                    id={`${idPrefix}-metric`}
                    placeholder="Tidak dikaitkan"
                    value={data.metric_key}
                    disabled={structureDisabled}
                    invalid={Boolean(errors.metric_key)}
                    onChange={(event) => changeMetric(event.target.value)}
                >
                    {metricKeys.map((item) => {
                        const taken = usedMetricKeys.includes(item.value) && item.value !== data.metric_key;

                        return (
                            <option key={item.value} value={item.value} disabled={taken}>
                                {item.label}
                                {taken ? ' (sudah dipakai)' : ''}
                            </option>
                        );
                    })}
                </Select>
                <FieldHint>Menghubungkan jawaban ke dasbor analitik. Tipe dan opsi menyesuaikan kunci yang dipilih.</FieldHint>
                <FieldError message={errors.metric_key} />
            </div>

            {hasOptions(data.question_type) && (
                <fieldset className="flex flex-col gap-2">
                    <legend className="text-sm font-medium text-foreground">Opsi Jawaban</legend>
                    {presetLocked && <FieldHint>Opsi bersifat baku untuk kunci metrik ini; Anda hanya dapat mengubah labelnya.</FieldHint>}
                    {data.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input
                                aria-label={`Label opsi ${index + 1}`}
                                value={option.label}
                                placeholder={`Opsi ${index + 1}`}
                                invalid={Boolean(errors[`options.${index}.label`])}
                                onChange={(event) => updateOption(index, event.target.value)}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={`Hapus opsi ${index + 1}`}
                                disabled={optionsDisabled || data.options.length <= 2}
                                onClick={() =>
                                    setData(
                                        'options',
                                        data.options.filter((_, position) => position !== index),
                                    )
                                }
                            >
                                <X aria-hidden="true" />
                            </Button>
                        </div>
                    ))}
                    <FieldError message={errorFor(errors, 'options')} />
                    <div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={optionsDisabled}
                            onClick={() => setData('options', [...data.options, { value: '', label: '' }])}
                        >
                            <Plus aria-hidden="true" />
                            Tambah Opsi
                        </Button>
                    </div>
                </fieldset>
            )}

            <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
                <Checkbox
                    label="Tampilkan hanya jika jawaban sebelumnya sesuai"
                    description="Logika kondisional: pertanyaan muncul bergantung pada jawaban pertanyaan sebelumnya."
                    checked={ruleEnabled}
                    disabled={structureDisabled}
                    onCheckedChange={setRuleEnabled}
                />
                {ruleEnabled && (
                    <div className="flex flex-col gap-3">
                        {referenceCandidates.length === 0 ? (
                            <FieldHint>Belum ada pertanyaan berpilihan sebelum pertanyaan ini yang dapat dijadikan acuan.</FieldHint>
                        ) : (
                            <>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor={`${idPrefix}-ref`}>Pertanyaan Acuan</Label>
                                    <Select
                                        id={`${idPrefix}-ref`}
                                        placeholder="Pilih pertanyaan acuan"
                                        value={data.conditional_rule.depends_on}
                                        disabled={structureDisabled}
                                        onChange={(event) =>
                                            setData('conditional_rule', { ...data.conditional_rule, depends_on: event.target.value, value: '' })
                                        }
                                    >
                                        {referenceCandidates.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.question_text}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor={`${idPrefix}-op`}>Kondisi</Label>
                                    <Select
                                        id={`${idPrefix}-op`}
                                        value={data.conditional_rule.operator}
                                        disabled={structureDisabled}
                                        onChange={(event) =>
                                            setData('conditional_rule', {
                                                ...data.conditional_rule,
                                                operator: event.target.value,
                                                value: event.target.value === 'in' ? [] : '',
                                            })
                                        }
                                    >
                                        <option value="equals">Jawabannya sama dengan</option>
                                        <option value="in">Jawabannya salah satu dari</option>
                                    </Select>
                                </div>
                                {reference && data.conditional_rule.operator === 'equals' && (
                                    <Select
                                        aria-label="Nilai kondisi"
                                        placeholder="Pilih jawaban"
                                        value={[].concat(data.conditional_rule.value || [])[0] ?? ''}
                                        disabled={structureDisabled}
                                        onChange={(event) => setData('conditional_rule', { ...data.conditional_rule, value: event.target.value })}
                                    >
                                        {reference.options.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </Select>
                                )}
                                {reference && data.conditional_rule.operator === 'in' && (
                                    <div className="flex flex-col gap-2">
                                        {reference.options.map((option) => (
                                            <Checkbox
                                                key={option.value}
                                                label={option.label}
                                                disabled={structureDisabled}
                                                checked={[].concat(data.conditional_rule.value || []).includes(option.value)}
                                                onCheckedChange={() => toggleRuleValue(option.value)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                        <FieldError message={errorFor(errors, 'conditional_rule')} />
                    </div>
                )}
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                <div className="flex flex-col gap-2 sm:flex-row">
                    {isNew ? (
                        <Button type="button" variant="outline" onClick={onClose}>
                            Batal
                        </Button>
                    ) : (
                        <>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Tutup
                            </Button>
                            {!isLocked && (
                                <Button type="button" variant="ghost" className="text-danger" onClick={() => setConfirmingDelete(true)}>
                                    <Trash2 aria-hidden="true" />
                                    Hapus Pertanyaan
                                </Button>
                            )}
                        </>
                    )}
                </div>
                <Button type="submit" loading={processing} loadingText="Menyimpan…">
                    {isNew ? 'Tambah Pertanyaan' : 'Simpan Pertanyaan'}
                </Button>
            </div>

            <Dialog open={confirmingDelete} onClose={() => setConfirmingDelete(false)}>
                <DialogHeader>
                    <DialogTitle>Hapus pertanyaan ini?</DialogTitle>
                    <DialogDescription>Pertanyaan akan dihapus permanen dari kuesioner.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setConfirmingDelete(false)}>
                        Batal
                    </Button>
                    <Button type="button" variant="destructive" loading={deleting} loadingText="Menghapus…" onClick={remove}>
                        Hapus Pertanyaan
                    </Button>
                </DialogFooter>
            </Dialog>
        </form>
    );
}
