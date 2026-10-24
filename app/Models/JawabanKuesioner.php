<?php

namespace App\Models;

use Database\Factories\JawabanKuesionerFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Satu jawaban alumni untuk satu pertanyaan. `answer` disimpan sebagai teks;
 * gunakan `App\Services\Kuesioner\AnswerCodec` untuk mengubah dari/ke nilai bertipe.
 */
#[Fillable([
    'respon_kuesioner_id',
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
     * Respon (draf/terkirim) tempat jawaban ini berada.
     */
    public function respon(): BelongsTo
    {
        return $this->belongsTo(ResponKuesioner::class, 'respon_kuesioner_id');
    }

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
