<?php

namespace App\Models;

use App\Enums\KuesionerStatus;
use App\Enums\ResponStatus;
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
    'status',
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
            'status' => KuesionerStatus::class,
        ];
    }

    /**
     * Daftar butir pertanyaan dalam kuesioner ini (urut sesuai `order`).
     */
    public function pertanyaan(): HasMany
    {
        return $this->hasMany(Pertanyaan::class, 'kuesioner_id')->orderBy('order')->orderBy('id');
    }

    /**
     * Seluruh jawaban alumni pada kuesioner ini.
     */
    public function jawaban(): HasMany
    {
        return $this->hasMany(JawabanKuesioner::class, 'kuesioner_id');
    }

    /**
     * Seluruh respon (draf maupun terkirim) pada kuesioner ini.
     */
    public function respon(): HasMany
    {
        return $this->hasMany(ResponKuesioner::class, 'kuesioner_id');
    }

    /**
     * Scope untuk kuesioner berstatus aktif (belum tentu dalam periode).
     */
    #[Scope]
    protected function active(Builder $query): Builder
    {
        return $query->where('status', KuesionerStatus::Active->value);
    }

    /**
     * Scope untuk kuesioner aktif yang tanggal hari ini berada dalam periodenya.
     */
    #[Scope]
    protected function open(Builder $query): Builder
    {
        $today = now()->toDateString();

        return $query->active()->whereDate('start_date', '<=', $today)->whereDate('end_date', '>=', $today);
    }

    /**
     * Aktif dan hari ini berada dalam periode, sehingga alumni boleh mengisi/merevisi.
     */
    public function isOpen(): bool
    {
        return $this->status === KuesionerStatus::Active
            && now()->startOfDay()->betweenIncluded($this->start_date->startOfDay(), $this->end_date->endOfDay());
    }

    /**
     * Apakah kuesioner ditujukan untuk angkatan lulus ini. Target kosong = semua angkatan.
     */
    public function targetsGraduationYear(?int $graduationYear): bool
    {
        $targets = $this->target_graduation_years ?? [];

        return $targets === [] || ($graduationYear !== null && in_array($graduationYear, array_map('intval', $targets), true));
    }

    /**
     * Struktur terkunci begitu ada alumni yang mulai menjawab, draf maupun terkirim (PRD KSN-07):
     * pertanyaan tidak boleh dihapus/ditambah dan tipe/opsi tidak boleh diubah; teks tetap boleh.
     */
    public function isStructureLocked(): bool
    {
        return $this->jawaban()->exists();
    }

    /**
     * Jumlah respon yang sudah dikirim.
     */
    public function submittedResponsesCount(): int
    {
        return $this->respon()->where('status', ResponStatus::Submitted->value)->count();
    }
}
