<?php

namespace App\Services\Admin\Analitik;

use App\Enums\KuesionerStatus;
use App\Models\Kuesioner;
use Illuminate\Http\Request;

/**
 * Filter analitik (PRD ANL-07): periode kuesioner, angkatan, jenis kelamin, peminatan.
 *
 * Query string: `kuesioner`, `angkatan[]`, `gender` (L/P), `major`.
 * Bila `kuesioner` kosong/tidak valid, dipakai kuesioner aktif dengan tenggat terdekat,
 * lalu kuesioner terbaru (berdasarkan `end_date`).
 */
final readonly class AnalitikFilter
{
    /**
     * @param  list<int>  $angkatan
     */
    public function __construct(
        public ?Kuesioner $kuesioner,
        public array $angkatan = [],
        public ?string $gender = null,
        public ?string $major = null,
    ) {}

    public static function fromRequest(Request $request): self
    {
        $kuesionerId = $request->integer('kuesioner') ?: null;

        $angkatan = collect((array) $request->input('angkatan', []))
            ->filter(fn ($year) => is_numeric($year))
            ->map(fn ($year) => (int) $year)
            ->unique()
            ->sort()
            ->values()
            ->all();

        $gender = in_array($request->input('gender'), ['L', 'P'], true) ? $request->input('gender') : null;
        $major = trim((string) $request->input('major', '')) ?: null;

        return new self(self::resolveKuesioner($kuesionerId), $angkatan, $gender, $major);
    }

    public static function resolveKuesioner(?int $kuesionerId): ?Kuesioner
    {
        if ($kuesionerId !== null && ($kuesioner = Kuesioner::find($kuesionerId)) !== null) {
            return $kuesioner;
        }

        return Kuesioner::query()->where('status', KuesionerStatus::Active->value)->orderBy('end_date')->first()
            ?? Kuesioner::query()->where('status', '!=', KuesionerStatus::Draft->value)->orderByDesc('end_date')->first()
            ?? Kuesioner::query()->orderByDesc('end_date')->first();
    }

    /**
     * Nilai filter untuk props `filters` dan query string tautan ekspor.
     *
     * @return array{kuesioner: ?int, angkatan: list<int>, gender: ?string, major: ?string}
     */
    public function toArray(): array
    {
        return [
            'kuesioner' => $this->kuesioner?->id,
            'angkatan' => $this->angkatan,
            'gender' => $this->gender,
            'major' => $this->major,
        ];
    }

    /**
     * Kunci cache yang stabil untuk kombinasi filter ini.
     */
    public function cacheKey(): string
    {
        return md5(json_encode($this->toArray()));
    }
}
