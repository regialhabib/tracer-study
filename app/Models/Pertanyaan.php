<?php

namespace App\Models;

use App\Enums\MetricKey;
use App\Enums\QuestionType;
use Database\Factories\PertanyaanFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Butir pertanyaan kuesioner.
 *
 * - `section`: nama bagian (string). Urutan bagian mengikuti `order` pertanyaan pertamanya.
 * - `options`: `list<array{value: string, label: string}>` untuk radio/checkbox/select, null untuk tipe lain.
 * - `metric_key`: string `App\Enums\MetricKey` atau null. Tidak di-cast agar data lama yang
 *   memakai kunci tak baku tidak memicu error; gunakan `metricKey()`.
 * - `conditional_rule`: `array{depends_on: int, operator: 'equals'|'in', value: string|list<string>}|null`.
 */
#[Fillable([
    'kuesioner_id',
    'section',
    'question_text',
    'help_text',
    'question_type',
    'options',
    'metric_key',
    'is_required',
    'order',
    'conditional_rule',
])]
class Pertanyaan extends Model
{
    /** @use HasFactory<PertanyaanFactory> */
    use HasFactory;

    /**
     * Nama bagian bawaan untuk pertanyaan tanpa `section`.
     */
    public const DEFAULT_SECTION = 'Umum';

    /**
     * Nama tabel terkait.
     *
     * @var string
     */
    protected $table = 'pertanyaan';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'question_type' => QuestionType::class,
            'options' => 'array',
            'conditional_rule' => 'array',
            'is_required' => 'boolean',
            'order' => 'integer',
        ];
    }

    /**
     * Kuesioner induk pemilik pertanyaan ini.
     */
    public function kuesioner(): BelongsTo
    {
        return $this->belongsTo(Kuesioner::class, 'kuesioner_id');
    }

    /**
     * Daftar jawaban yang diberikan alumni untuk pertanyaan ini.
     */
    public function jawaban(): HasMany
    {
        return $this->hasMany(JawabanKuesioner::class, 'pertanyaan_id');
    }

    public function metricKey(): ?MetricKey
    {
        return $this->metric_key === null ? null : MetricKey::tryFrom($this->metric_key);
    }

    public function sectionName(): string
    {
        return $this->section !== null && trim($this->section) !== '' ? $this->section : self::DEFAULT_SECTION;
    }

    /**
     * Nilai opsi yang sah untuk pertanyaan ini.
     *
     * @return list<string>
     */
    public function optionValues(): array
    {
        return array_values(array_map(fn (array $option): string => (string) $option['value'], $this->options ?? []));
    }

    /**
     * Label opsi untuk sebuah nilai; nilai apa adanya bila tidak ditemukan.
     */
    public function optionLabel(string $value): string
    {
        foreach ($this->options ?? [] as $option) {
            if ((string) $option['value'] === $value) {
                return (string) $option['label'];
            }
        }

        return $value;
    }
}
