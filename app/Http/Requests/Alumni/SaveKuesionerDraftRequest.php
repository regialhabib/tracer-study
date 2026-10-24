<?php

namespace App\Http\Requests\Alumni;

use Illuminate\Foundation\Http\FormRequest;

class SaveKuesionerDraftRequest extends FormRequest
{
    /**
     * Otorisasi dijaga oleh middleware `role:alumni` dan pemeriksaan ketersediaan di controller.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'section' => ['required', 'string', 'max:255'],
            'answers' => ['nullable', 'array'],
            'validate' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return ['section' => 'bagian', 'answers' => 'jawaban'];
    }
}
