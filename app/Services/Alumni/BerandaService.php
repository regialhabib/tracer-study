<?php

namespace App\Services\Alumni;

use App\Models\Berita;
use App\Models\Kuesioner;
use App\Models\User;
use App\Services\Kuesioner\KuesionerAvailabilityService;
use Illuminate\Database\Eloquent\Collection;

class BerandaService
{
    /**
     * Jumlah kabar terbaru yang ditampilkan di Beranda alumni.
     */
    private const BERITA_LIMIT = 3;

    public function __construct(
        private KuesionerAvailabilityService $availability,
        private PengisianKuesionerService $pengisianService,
    ) {}

    /**
     * Menyusun data Beranda alumni: kuesioner yang berlaku, status pengisian, dan kabar terbaru.
     *
     * @return array{activeKuesioner: ?Kuesioner, hasFilled: bool, kuesionerList: list<array<string, mixed>>, beritaList: Collection<int, Berita>, agendaTerdekat: ?Berita}
     */
    public function getBerandaData(User $user): array
    {
        $activeKuesioner = $this->availability->forAlumni($user)->first();

        return [
            'activeKuesioner' => $activeKuesioner,
            'hasFilled' => (bool) $activeKuesioner?->respon->first()?->isSubmitted(),
            'kuesionerList' => $this->pengisianService->listForAlumni($user),
            'beritaList' => Berita::published()->latest('published_at')->take(self::BERITA_LIMIT)->get()->each->makeHidden('content'),
            'agendaTerdekat' => Berita::upcomingAgenda()->first()?->makeHidden('content'),
        ];
    }
}
