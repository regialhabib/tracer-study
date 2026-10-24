<?php

namespace App\Http\Requests\Pesan;

use Illuminate\Foundation\Http\FormRequest;

class PengaturanPesanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAlumni() === true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'allow_alumni_messages' => ['required', 'boolean'],
        ];
    }
}
