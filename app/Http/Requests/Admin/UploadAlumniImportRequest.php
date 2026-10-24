<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UploadAlumniImportRequest extends FormRequest
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
            'file' => ['required', 'file', 'mimes:xlsx,csv', 'max:5120'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return ['file' => 'berkas'];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'file.required' => 'Pilih berkas Excel (.xlsx) atau CSV terlebih dahulu.',
            'file.mimes' => 'Format berkas tidak didukung. Gunakan berkas .xlsx atau .csv.',
            'file.max' => 'Ukuran berkas maksimal 5 MB.',
        ];
    }
}
