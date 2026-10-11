<?php

namespace App\Models;

use Database\Factories\PertanyaanFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'kuesioner_id',
    'section',
    'question_text',
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
}
