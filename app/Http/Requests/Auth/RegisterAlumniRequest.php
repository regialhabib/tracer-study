<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use App\Rules\WhatsAppNumber;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterAlumniRequest extends FormRequest
{
    /**
     * Pendaftaran mandiri terbuka untuk tamu (dibatasi middleware `guest`).
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'nisn' => ['nullable', 'string', 'max:20', 'unique:'.User::class],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Password::defaults()],
            'gender' => ['nullable', 'in:L,P'],
            'major' => ['nullable', 'string', 'max:100'],
            'graduation_year' => ['nullable', 'integer', 'min:2000', 'max:'.(date('Y') + 1)],
            'phone_number' => ['required', 'string', 'max:25', new WhatsAppNumber],
            'data_consent' => ['accepted'],
        ];
    }

    /**
     * Pesan validasi khusus.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'data_consent.accepted' => 'Anda perlu menyetujui penggunaan data untuk melanjutkan.',
        ];
    }
}
