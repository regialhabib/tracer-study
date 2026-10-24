<?php

namespace App\Http\Requests\Admin;

use App\Enums\BeritaStatus;
use App\Enums\BeritaType;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBeritaRequest extends FormRequest
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
        $isAgenda = fn (): bool => $this->input('type') === BeritaType::Agenda->value;

        return [
            'type' => ['required', Rule::enum(BeritaType::class)],
            'title' => ['required', 'string', 'max:200'],
            'content' => ['required', 'string', function (string $attribute, mixed $value, Closure $fail): void {
                $text = html_entity_decode(strip_tags((string) $value), ENT_QUOTES | ENT_HTML5, 'UTF-8');

                if (preg_replace('/[\s\x{00A0}]+/u', '', $text) === '') {
                    $fail('Isi tidak boleh kosong.');
                }
            }],
            'thumbnail' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_thumbnail' => ['nullable', 'boolean'],
            'status' => ['required', Rule::enum(BeritaStatus::class)],
            'published_at' => ['nullable', 'date'],
            'event_date' => [Rule::requiredIf($isAgenda), 'nullable', 'date'],
            'location' => [Rule::requiredIf($isAgenda), 'nullable', 'string', 'max:255'],
            'registration_link' => [Rule::requiredIf($isAgenda), 'nullable', 'url:http,https', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'type' => 'tipe',
            'title' => 'judul',
            'content' => 'isi',
            'thumbnail' => 'gambar sampul',
            'status' => 'status',
            'published_at' => 'jadwal terbit',
            'event_date' => 'tanggal dan jam acara',
            'location' => 'lokasi',
            'registration_link' => 'tautan pendaftaran',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'thumbnail.image' => 'Gambar sampul harus berupa berkas gambar.',
            'thumbnail.mimes' => 'Gambar sampul harus berformat JPG, PNG, atau WebP.',
            'thumbnail.max' => 'Ukuran gambar sampul maksimal 2 MB.',
            'event_date.required' => 'Tanggal dan jam acara wajib diisi untuk agenda.',
            'location.required' => 'Lokasi wajib diisi untuk agenda.',
            'registration_link.required' => 'Tautan pendaftaran wajib diisi untuk agenda.',
        ];
    }

    /**
     * Data tervalidasi tanpa berkas sampul.
     *
     * @return array<string, mixed>
     */
    public function payload(): array
    {
        return collect($this->validated())->except(['thumbnail', 'remove_thumbnail'])->all();
    }
}
