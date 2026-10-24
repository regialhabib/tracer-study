<?php

namespace App\Http\Requests\Admin\Kuesioner;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SaveKuesionerRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'target_graduation_years' => ['nullable', 'array'],
            'target_graduation_years.*' => ['integer', 'between:1990,2100', 'distinct'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'title' => 'judul',
            'description' => 'deskripsi',
            'start_date' => 'tanggal buka',
            'end_date' => 'tanggal tutup',
            'target_graduation_years' => 'target angkatan',
            'target_graduation_years.*' => 'tahun angkatan',
        ];
    }
}
