<?php

namespace App\Services\Kuesioner;

use App\Models\Kuesioner;
use App\Models\User;
use Illuminate\Support\Collection;

/**
 * Kuesioner yang berlaku untuk seorang alumni (PRD §8.4, KSN-10): berstatus aktif, hari ini
 * dalam periode, dan angkatan lulusnya termasuk target (target kosong = semua angkatan).
 */
class KuesionerAvailabilityService
{
    /**
     * @return Collection<int, Kuesioner> urut tenggat terdekat; `respon` milik alumni ikut dimuat
     */
    public function forAlumni(User $user): Collection
    {
        $graduationYear = $user->profile?->graduation_year;

        return Kuesioner::query()
            ->open()
            ->withCount('pertanyaan')
            ->with(['respon' => fn ($query) => $query->where('user_id', $user->id)])
            ->orderBy('end_date')
            ->get()
            ->filter(fn (Kuesioner $kuesioner): bool => $kuesioner->targetsGraduationYear($graduationYear))
            ->values();
    }

    /**
     * Apakah alumni boleh membuka/mengisi/merevisi kuesioner ini sekarang.
     */
    public function canFill(User $user, Kuesioner $kuesioner): bool
    {
        return $user->isAlumni()
            && $kuesioner->isOpen()
            && $kuesioner->targetsGraduationYear($user->profile?->graduation_year);
    }
}
