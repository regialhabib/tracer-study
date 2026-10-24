<?php

namespace App\Http\Requests\Admin;

use App\Enums\BeritaType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BeritaFilterRequest extends FormRequest
{
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
            'q' => ['nullable', 'string', 'max:100'],
            'tipe' => ['nullable', Rule::enum(BeritaType::class)],
            'status' => ['nullable', Rule::in(['draf', 'terjadwal', 'terbit'])],
        ];
    }

    /**
     * Filter yang terisi saja.
     *
     * @return array{q?: string, tipe?: string, status?: string}
     */
    public function filters(): array
    {
        return array_filter($this->validated(), fn ($value) => $value !== null && $value !== '');
    }
}
