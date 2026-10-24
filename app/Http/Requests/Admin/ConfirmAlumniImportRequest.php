<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ConfirmAlumniImportRequest extends FormRequest
{
    /**
     * Akses sudah dijaga grup rute role:admin.
     */
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
            'token' => ['required', 'string', 'size:40', 'alpha_num'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'token.*' => 'Sesi pratinjau tidak valid. Silakan unggah ulang berkas Anda.',
        ];
    }
}
