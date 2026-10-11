<?php

namespace App\Models;

use Database\Factories\KuesionerFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'title',
    'description',
    'target_graduation_years',
    'start_date',
    'end_date',
    'is_active',
])]
class Kuesioner extends Model
{
    /** @use HasFactory<KuesionerFactory> */
    use HasFactory;

    /**
     * Nama tabel terkait.
     *
     * @var string
     */
    protected $table = 'kuesioner';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'target_graduation_years' => 'array',
            'start_date' => 'date',
            'end_date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Daftar butir pertanyaan dalam kuesioner ini.
     */
    public function pertanyaan(): HasMany
    {
        return $this->hasMany(Pertanyaan::class, 'kuesioner_id')->orderBy('order');
    }

    /**
     * Seluruh jawaban alumni pada kuesioner ini.
     */
    public function jawaban(): HasMany
    {
        return $this->hasMany(JawabanKuesioner::class, 'kuesioner_id');
    }

    /**
     * Scope untuk kuesioner yang sedang aktif.
     */
    #[Scope]
    protected function active(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
