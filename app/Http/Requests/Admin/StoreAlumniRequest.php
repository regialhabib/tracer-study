<?php

namespace App\Http\Requests\Admin;

use App\Enums\AlumniStatus;
use App\Rules\WhatsAppNumber;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAlumniRequest extends FormRequest
{
    /**
     * Otorisasi dijaga oleh middleware `role:admin` pada grup rute.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Id akun yang dikecualikan dari pengecekan unik (null saat membuat baru).
     */
    protected function ignoredUserId(): ?int
    {
        return null;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $ignoredId = $this->ignoredUserId();

        return [
            'name' => ['required', 'string', 'max:255'],
            'nisn' => ['required', 'string', 'regex:/^\d{10}$/', Rule::unique('users', 'nisn')->ignore($ignoredId)],
            'email' => ['nullable', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($ignoredId)],
            'gender' => ['required', Rule::in(['L', 'P'])],
            'birth_date' => ['nullable', 'date', 'before:today'],
            'birth_place' => ['nullable', 'string', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:20', new WhatsAppNumber],
            'stambuk_number' => ['nullable', 'string', 'max:50'],
            'entry_year' => ['required', 'integer', 'digits:4', 'min:1990'],
            'graduation_year' => ['required', 'integer', 'digits:4', 'gte:entry_year'],
            'major' => ['required', 'string', 'max:255'],
            'pesantren_program' => ['nullable', 'string', 'max:255'],
            'tahfidz_count' => ['nullable', 'integer', 'min:0', 'max:30'],
            'dormitory_complex' => ['nullable', 'string', 'max:255'],
            'current_status' => ['required', Rule::enum(AlumniStatus::class)],
            'city' => ['nullable', 'string', 'max:255'],
            'province' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'stambuk_number' => 'nomor stambuk',
            'pesantren_program' => 'program pesantren',
            'tahfidz_count' => 'jumlah juz tahfidz',
            'dormitory_complex' => 'kompleks asrama',
        ];
    }

    /**
     * Menyiapkan input: string kosong dianggap null (middleware bawaan) dan NISN dirapikan.
     */
    protected function prepareForValidation(): void
    {
        if (is_string($this->input('nisn'))) {
            $this->merge(['nisn' => trim($this->input('nisn'))]);
        }
    }

    /**
     * Memisahkan data tervalidasi menjadi data akun dan data profil.
     *
     * @return array{user: array<string, mixed>, profile: array<string, mixed>}
     */
    public function payload(): array
    {
        $validated = $this->validated();

        return [
            'user' => [
                'name' => $validated['name'],
                'nisn' => $validated['nisn'],
                'email' => $validated['email'] ?? null,
            ],
            'profile' => collect($validated)->except(['name', 'nisn', 'email'])->all(),
        ];
    }
}
