<?php

namespace App\Http\Requests\Pesan;

use Illuminate\Foundation\Http\FormRequest;

class KontakFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'q' => ['nullable', 'string', 'max:100'],
            'angkatan' => ['nullable', 'integer', 'between:1900,2100'],
            'peminatan' => ['nullable', 'string', 'max:100'],
        ];
    }
}
