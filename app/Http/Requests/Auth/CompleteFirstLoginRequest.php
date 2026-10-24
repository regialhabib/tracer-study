<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use App\Rules\WhatsAppNumber;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class CompleteFirstLoginRequest extends FormRequest
{
    /**
     * Hanya pengguna yang masih wajib onboarding yang boleh mengirim form ini.
     */
    public function authorize(): bool
    {
        return (bool) $this->user()?->first_login;
    }

    /**
     * Alumni wajib mengisi email, nomor WhatsApp, dan persetujuan data (AUTH-02, UU PDP).
     * Admin cukup mengganti kata sandi; email boleh dikosongkan agar tetap memakai email lama.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $user = $this->user();

        $passwordRules = ['required', 'confirmed', Password::defaults()];
        $emailRules = ['string', 'lowercase', 'email', 'max:255', Rule::unique(User::class)->ignore($user->id)];

        if ($user->isAdmin()) {
            return [
                'email' => ['nullable', ...$emailRules],
                'password' => $passwordRules,
            ];
        }

        return [
            'email' => ['required', ...$emailRules],
            'phone_number' => ['required', 'string', 'max:25', new WhatsAppNumber],
            'data_consent' => ['accepted'],
            'password' => $passwordRules,
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
