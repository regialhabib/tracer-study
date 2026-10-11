<?php

namespace App\Models;

use Database\Factories\JawabanKuesionerFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'kuesioner_id',
    'user_id',
    'pertanyaan_id',
    'answer',
])]
class JawabanKuesioner extends Model
{
    /** @use HasFactory<JawabanKuesionerFactory> */
    use HasFactory;

    /**
     * Nama tabel terkait.
     *
     * @var string
     */
    protected $table = 'jawaban_kuesioner';

    /**
     * Kuesioner induk dari jawaban ini.
     */
    public function kuesioner(): BelongsTo
    {
        return $this->belongsTo(Kuesioner::class, 'kuesioner_id');
    }

    /**
     * Akun alumni yang memberikan jawaban ini.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Butir pertanyaan yang dijawab.
     */
    public function pertanyaan(): BelongsTo
    {
        return $this->belongsTo(Pertanyaan::class, 'pertanyaan_id');
    }
}
