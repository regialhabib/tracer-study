<?php

namespace App\Services\Notifikasi;

use App\Enums\ResponStatus;
use App\Models\Kuesioner;
use App\Models\ResponKuesioner;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

/**
 * Alumni sasaran sebuah kuesioner: akun alumni aktif yang angkatan lulusnya termasuk target
 * (target kosong = semua angkatan), selaras dengan `Kuesioner::targetsGraduationYear()`.
 */
class KuesionerAudienceService
{
    /**
     * @return Builder<User>
     */
    public function targets(Kuesioner $kuesioner): Builder
    {
        $years = array_map('intval', $kuesioner->target_graduation_years ?? []);

        return User::query()
            ->alumni()
            ->active()
            ->when($years !== [], fn (Builder $query) => $query->whereHas(
                'profile',
                fn (Builder $profile) => $profile->whereIn('graduation_year', $years),
            ));
    }

    /**
     * Sasaran yang belum mengirim jawaban (tidak punya respon berstatus terkirim).
     *
     * @return Builder<User>
     */
    public function belumMengisi(Kuesioner $kuesioner): Builder
    {
        return $this->targets($kuesioner)->whereNotIn(
            'users.id',
            ResponKuesioner::query()
                ->select('user_id')
                ->where('kuesioner_id', $kuesioner->id)
                ->where('status', ResponStatus::Submitted->value),
        );
    }
}
