<?php

namespace App\Http\Requests;

use App\Enums\AlumniStatus;
use App\Models\User;
use App\Rules\WhatsAppNumber;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Apakah pengguna adalah alumni yang sudah memiliki profil alumni.
     */
    public function hasAlumniProfile(): bool
    {
        $user = $this->user();

        return $user->isAlumni() && $user->profile()->exists();
    }

    /**
     * Whitelist field. Field resmi (NISN, angkatan, peminatan, jenis kelamin, nama alumni)
     * sengaja tidak ada sehingga tidak pernah lolos `validated()`.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
        ];

        if (! $this->hasAlumniProfile()) {
            $rules['name'] = ['required', 'string', 'max:255'];

            return $rules;
        }

        return $rules + [
            'phone_number' => ['required', 'string', 'max:20', new WhatsAppNumber],
            'city' => ['nullable', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:500'],
            'current_status' => ['required', Rule::enum(AlumniStatus::class)],
        ];
    }
}
