<?php

namespace App\Http\Requests\Admin\Kuesioner;

use App\Enums\MetricKey;
use App\Enums\QuestionType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SavePertanyaanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'section' => [$this->isMethod('POST') ? 'required' : 'prohibited', 'string', 'max:100'],
            'question_text' => ['required', 'string', 'max:500'],
            'help_text' => ['nullable', 'string', 'max:500'],
            'question_type' => ['required', Rule::enum(QuestionType::class)],
            'is_required' => ['required', 'boolean'],
            'options' => ['nullable', 'array', 'max:30'],
            'options.*.label' => ['required', 'string', 'max:150'],
            'options.*.value' => ['nullable', 'string', 'max:100'],
            'metric_key' => ['nullable', Rule::enum(MetricKey::class)],
            'conditional_rule' => ['nullable', 'array'],
            'conditional_rule.depends_on' => ['required_with:conditional_rule', 'integer'],
            'conditional_rule.operator' => ['required_with:conditional_rule', Rule::in(['equals', 'in'])],
            'conditional_rule.value' => ['required_with:conditional_rule'],
            'conditional_rule.value.*' => ['string', 'max:100'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'section' => 'bagian',
            'question_text' => 'teks pertanyaan',
            'help_text' => 'teks bantuan',
            'question_type' => 'tipe pertanyaan',
            'is_required' => 'status wajib',
            'options' => 'opsi',
            'options.*.label' => 'label opsi',
            'options.*.value' => 'nilai opsi',
            'metric_key' => 'kunci metrik',
            'conditional_rule' => 'logika kondisional',
            'conditional_rule.depends_on' => 'pertanyaan acuan',
            'conditional_rule.operator' => 'operator',
            'conditional_rule.value' => 'nilai kondisi',
        ];
    }
}
