<?php

namespace App\Services\Alumni;

use App\Models\Berita;
use App\Models\JawabanKuesioner;
use App\Models\Kuesioner;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class BerandaService
{
    /**
     * Jumlah kabar terbaru yang ditampilkan di Beranda alumni.
     */
    private const BERITA_LIMIT = 3;

    /**
     * Menyusun data Beranda alumni: kuesioner aktif, status pengisian, dan kabar terbaru.
     *
     * @return array{activeKuesioner: ?Kuesioner, hasFilled: bool, beritaList: Collection<int, Berita>}
     */
    public function getBerandaData(User $user): array
    {
        $activeKuesioner = Kuesioner::withCount('pertanyaan')->where('is_active', true)->first();

        $hasFilled = $activeKuesioner !== null
            && JawabanKuesioner::where('kuesioner_id', $activeKuesioner->id)
                ->where('user_id', $user->id)
                ->exists();

        return [
            'activeKuesioner' => $activeKuesioner,
            'hasFilled' => $hasFilled,
            'beritaList' => Berita::published()->latest()->take(self::BERITA_LIMIT)->get(),
        ];
    }
}
