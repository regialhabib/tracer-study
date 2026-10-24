<?php

namespace App\Http\Requests\Admin;

use App\Enums\AccountStatus;
use App\Enums\AlumniStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AlumniFilterRequest extends FormRequest
{
    /**
     * Otorisasi dijaga oleh middleware `role:admin` pada grup rute.
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
            'q' => ['nullable', 'string', 'max:100'],
            'angkatan' => ['nullable', 'integer', 'digits:4'],
            'gender' => ['nullable', Rule::in(['L', 'P'])],
            'major' => ['nullable', 'string', 'max:255'],
            'status_kegiatan' => ['nullable', Rule::enum(AlumniStatus::class)],
            'status_akun' => ['nullable', Rule::enum(AccountStatus::class)],
            'tampilkan_terhapus' => ['nullable', 'boolean'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    /**
     * Filter tervalidasi tanpa nilai kosong.
     *
     * @return array{q?: string, angkatan?: int, gender?: string, major?: string, status_kegiatan?: string, status_akun?: string, tampilkan_terhapus?: bool}
     */
    public function filters(): array
    {
        $filters = collect($this->safe()->except('page'))
            ->filter(fn ($value) => $value !== null && $value !== '')
            ->all();

        if (isset($filters['tampilkan_terhapus'])) {
            $filters['tampilkan_terhapus'] = (bool) $filters['tampilkan_terhapus'];
        }

        return $filters;
    }
}
