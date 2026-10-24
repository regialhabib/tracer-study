<?php

namespace App\Models;

use App\Enums\ResponStatus;
use Database\Factories\ResponKuesionerFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Respon satu alumni terhadap satu kuesioner (unik per pasangan). Status `draft` selama
 * pengisian, `submitted` setelah dikirim; tetap bisa direvisi selama kuesioner masih buka.
 */
#[Fillable([
    'kuesioner_id',
    'user_id',
    'status',
    'current_section',
    'submitted_at',
])]
class ResponKuesioner extends Model
{
    /** @use HasFactory<ResponKuesionerFactory> */
    use HasFactory;

    /**
     * Nama tabel terkait.
     *
     * @var string
     */
    protected $table = 'respon_kuesioner';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => ResponStatus::class,
            'submitted_at' => 'datetime',
        ];
    }

    public function kuesioner(): BelongsTo
    {
        return $this->belongsTo(Kuesioner::class, 'kuesioner_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function jawaban(): HasMany
    {
        return $this->hasMany(JawabanKuesioner::class, 'respon_kuesioner_id');
    }

    public function isSubmitted(): bool
    {
        return $this->status === ResponStatus::Submitted;
    }
}
