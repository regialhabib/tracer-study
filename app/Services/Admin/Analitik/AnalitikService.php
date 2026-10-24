<?php

namespace App\Services\Admin\Analitik;

use App\Enums\AccountStatus;
use App\Enums\AlumniStatus;
use App\Enums\KuesionerStatus;
use App\Enums\MetricKey;
use App\Enums\QuestionType;
use App\Enums\ResponStatus;
use App\Models\AlumniProfile;
use App\Models\Kuesioner;
use App\Models\Message;
use App\Models\Pertanyaan;
use App\Models\User;
use App\Services\Kuesioner\KuesionerPresenter;
use App\Services\Support\WhatsAppLinkService;
use Closure;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Agregasi analitik tracer study (PRD ANL-01–09). Semua metode berbasis filter di-cache 10 menit
 * per kuesioner (kunci versi dinaikkan oleh `flushCache`).
 *
 * Populasi target: alumni (termasuk soft-deleted) yang cocok dengan filter & target angkatan kuesioner,
 * dan akunnya aktif atau sudah punya respon `submitted`. Responden: populasi dengan respon `submitted`.
 */
class AnalitikService
{
    private const CACHE_TTL_SECONDS = 600;

    private const TEXT_LIMIT = 50;

    public function __construct(
        private KuesionerPresenter $presenter,
        private WhatsAppLinkService $whatsApp,
    ) {}

    /**
     * @return array{kuesioner: list<array{id: int, title: string, status: string, start_date: string, end_date: string}>, angkatan: list<int>, majors: list<string>}
     */
    public function filterOptions(): array
    {
        $kuesioner = Kuesioner::query()
            ->where('status', '!=', KuesionerStatus::Draft->value)
            ->orderByDesc('end_date')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Kuesioner $item): array => [
                'id' => $item->id,
                'title' => $item->title,
                'status' => $item->status->value,
                'start_date' => $item->start_date->toDateString(),
                'end_date' => $item->end_date->toDateString(),
            ])
            ->all();

        $angkatan = DB::table('alumni_profiles')
            ->distinct()
            ->orderBy('graduation_year')
            ->pluck('graduation_year')
            ->map(fn ($year): int => (int) $year)
            ->all();

        $majors = DB::table('alumni_profiles')
            ->whereNotNull('major')
            ->where('major', '!=', '')
            ->distinct()
            ->orderBy('major')
            ->pluck('major')
            ->all();

        return ['kuesioner' => $kuesioner, 'angkatan' => $angkatan, 'majors' => $majors];
    }

    /**
     * @return array{target_count: int, submitted_count: int, draft_count: int, response_rate: float}
     */
    public function summary(AnalitikFilter $f): array
    {
        return $this->cached($f, 'summary', function () use ($f): array {
            if ($f->kuesioner === null) {
                return ['target_count' => 0, 'submitted_count' => 0, 'draft_count' => 0, 'response_rate' => 0.0];
            }

            $target = $this->population($f)->count();
            $submitted = $this->population($f)->whereNotNull('r.id')->count();
            $draft = $this->population($f)
                ->whereExists(function (QueryBuilder $query) use ($f): void {
                    $query->selectRaw('1')
                        ->from('respon_kuesioner as d')
                        ->whereColumn('d.user_id', 'users.id')
                        ->where('d.kuesioner_id', $f->kuesioner->id)
                        ->where('d.status', ResponStatus::Draft->value);
                })
                ->count();

            return [
                'target_count' => $target,
                'submitted_count' => $submitted,
                'draft_count' => $draft,
                'response_rate' => $this->percent($submitted, $target),
            ];
        });
    }

    /**
     * @return list<array{angkatan: int, target: int, submitted: int, rate: float}>
     */
    public function responseRateByAngkatan(AnalitikFilter $f): array
    {
        return $this->cached($f, 'angkatan', function () use ($f): array {
            if ($f->kuesioner === null) {
                return [];
            }

            return $this->population($f)
                ->selectRaw('ap.graduation_year as angkatan, count(*) as target, count(r.id) as submitted')
                ->groupBy('ap.graduation_year')
                ->orderBy('ap.graduation_year')
                ->get()
                ->map(fn (object $row): array => [
                    'angkatan' => (int) $row->angkatan,
                    'target' => (int) $row->target,
                    'submitted' => (int) $row->submitted,
                    'rate' => $this->percent((int) $row->submitted, (int) $row->target),
                ])
                ->all();
        });
    }

    /**
     * @return ?list<array{value: string, label: string, count: int, percent: float}>
     */
    public function statusDistribution(AnalitikFilter $f): ?array
    {
        return $this->cached($f, 'status', function () use ($f): ?array {
            $question = $this->metricQuestion($f, MetricKey::StatusKegiatan);

            if ($question === null) {
                return null;
            }

            $counts = $this->answerQuery($f, $question)
                ->selectRaw('j.answer as answer, count(*) as total')
                ->groupBy('j.answer')
                ->pluck('total', 'answer');

            return $this->enumDistribution($counts->map(fn ($total): int => (int) $total)->all());
        });
    }

    /**
     * @return ?array{count: int, mean: ?float, median: ?float, distribution: list<array{label: string, count: int}>}
     */
    public function masaTunggu(AnalitikFilter $f): ?array
    {
        return $this->cached($f, 'masa_tunggu', function () use ($f): ?array {
            $question = $this->metricQuestion($f, MetricKey::MasaTungguBulan);

            if ($question === null) {
                return null;
            }

            $values = $this->numericValues($this->answerQuery($f, $question)->pluck('j.answer')->all());
            $buckets = ['0–3 bln' => 0, '4–6 bln' => 0, '7–12 bln' => 0, '> 12 bln' => 0];

            foreach ($values as $value) {
                $label = match (true) {
                    $value <= 3 => '0–3 bln',
                    $value <= 6 => '4–6 bln',
                    $value <= 12 => '7–12 bln',
                    default => '> 12 bln',
                };
                $buckets[$label]++;
            }

            return [
                'count' => count($values),
                'mean' => $values === [] ? null : round(array_sum($values) / count($values), 1),
                'median' => $values === [] ? null : round($this->median($values), 1),
                'distribution' => collect($buckets)->map(fn (int $count, string $label): array => ['label' => $label, 'count' => $count])->values()->all(),
            ];
        });
    }

    /**
     * @return ?list<array{value: string, label: string, count: int, percent: float}>
     */
    public function pendapatan(AnalitikFilter $f): ?array
    {
        return $this->cached($f, 'pendapatan', function () use ($f): ?array {
            $question = $this->metricQuestion($f, MetricKey::RentangPendapatan);

            if ($question === null) {
                return null;
            }

            $query = $this->answerQuery($f, $question);
            $statusQuestion = $this->metricQuestion($f, MetricKey::StatusKegiatan);

            if ($statusQuestion !== null) {
                $query->join('jawaban_kuesioner as s', function ($join) use ($statusQuestion): void {
                    $join->on('s.respon_kuesioner_id', '=', 'r.id')->where('s.pertanyaan_id', '=', $statusQuestion->id);
                })->whereIn('s.answer', [AlumniStatus::Bekerja->value, AlumniStatus::Wirausaha->value]);
            }

            $counts = $query->selectRaw('j.answer as answer, count(*) as total')->groupBy('j.answer')->pluck('total', 'answer');
            $presets = MetricKey::RentangPendapatan->presetOptions() ?? [];
            $total = 0;

            foreach ($presets as $preset) {
                $total += (int) ($counts[$preset['value']] ?? 0);
            }

            return array_map(fn (array $preset): array => [
                'value' => $preset['value'],
                'label' => $question->optionLabel($preset['value']),
                'count' => (int) ($counts[$preset['value']] ?? 0),
                'percent' => $this->percent((int) ($counts[$preset['value']] ?? 0), $total),
            ], $presets);
        });
    }

    /**
     * @return ?list<array{name: string, count: int}>
     */
    public function topLembaga(AnalitikFilter $f, int $limit = 10): ?array
    {
        return $this->cached($f, 'lembaga_'.$limit, function () use ($f, $limit): ?array {
            $question = $this->metricQuestion($f, MetricKey::NamaLembaga);

            if ($question === null) {
                return null;
            }

            $rows = $this->answerQuery($f, $question)
                ->selectRaw('j.answer as answer, count(*) as total')
                ->groupBy('j.answer')
                ->get();

            $groups = [];

            foreach ($rows as $row) {
                $spelling = trim((string) $row->answer);

                if ($spelling === '') {
                    continue;
                }

                $key = mb_strtolower($spelling);
                $groups[$key] ??= ['total' => 0, 'best' => $spelling, 'best_count' => 0];
                $groups[$key]['total'] += (int) $row->total;

                if ((int) $row->total > $groups[$key]['best_count']) {
                    $groups[$key]['best'] = $spelling;
                    $groups[$key]['best_count'] = (int) $row->total;
                }
            }

            return collect($groups)
                ->map(fn (array $group): array => ['name' => $group['best'], 'count' => $group['total']])
                ->sortBy([['count', 'desc'], ['name', 'asc']])
                ->take($limit)
                ->values()
                ->all();
        });
    }

    /**
     * @return ?array{count: int, mean: ?float, distribution: list<array{score: int, count: int}>}
     */
    public function relevansiIlmu(AnalitikFilter $f): ?array
    {
        return $this->cached($f, 'relevansi', function () use ($f): ?array {
            $question = $this->metricQuestion($f, MetricKey::RelevansiIlmu);

            if ($question === null) {
                return null;
            }

            $counts = $this->answerQuery($f, $question)
                ->selectRaw('j.answer as answer, count(*) as total')
                ->groupBy('j.answer')
                ->pluck('total', 'answer');

            $distribution = [];
            $count = 0;
            $sum = 0;

            foreach (range(1, 5) as $score) {
                $scoreCount = (int) ($counts[(string) $score] ?? 0);
                $distribution[] = ['score' => $score, 'count' => $scoreCount];
                $count += $scoreCount;
                $sum += $score * $scoreCount;
            }

            return ['count' => $count, 'mean' => $count === 0 ? null : round($sum / $count, 1), 'distribution' => $distribution];
        });
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function questionRecap(AnalitikFilter $f): array
    {
        return $this->cached($f, 'recap', function () use ($f): array {
            if ($f->kuesioner === null) {
                return [];
            }

            $questions = $f->kuesioner->pertanyaan()->get();

            $grouped = $this->population($f)
                ->whereNotNull('r.id')
                ->join('jawaban_kuesioner as j', 'j.respon_kuesioner_id', '=', 'r.id')
                ->whereNotNull('j.answer')
                ->where('j.answer', '!=', '')
                ->selectRaw('j.pertanyaan_id as pertanyaan_id, j.answer as answer, count(*) as total')
                ->groupBy('j.pertanyaan_id', 'j.answer')
                ->get()
                ->groupBy('pertanyaan_id');

            return $questions->map(fn (Pertanyaan $question): array => $this->recapFor($f, $question, $grouped->get($question->id, collect())))->all();
        });
    }

    /**
     * Alumni aktif dalam populasi yang belum mengirim kuesioner, dengan tautan pengingat WhatsApp.
     *
     * @return Collection<int, array{id: int, name: string, nisn: ?string, angkatan: int, phone_number: ?string, whatsapp_url: ?string}>
     */
    public function nonRespondents(AnalitikFilter $f): Collection
    {
        if ($f->kuesioner === null) {
            return collect();
        }

        $url = route('alumni.kuesioner.show', $f->kuesioner);

        return $this->population($f)
            ->whereNull('r.id')
            ->where('users.status', AccountStatus::Active->value)
            ->whereNull('users.deleted_at')
            ->select('users.id', 'users.name', 'users.nisn', 'ap.graduation_year', 'ap.phone_number')
            ->orderBy('ap.graduation_year')
            ->orderBy('users.name')
            ->orderBy('users.id')
            ->get()
            ->map(fn (object $row): array => [
                'id' => (int) $row->id,
                'name' => $row->name,
                'nisn' => $row->nisn,
                'angkatan' => (int) $row->graduation_year,
                'phone_number' => $row->phone_number,
                'whatsapp_url' => $this->whatsApp->buildTemplateUrl($row->phone_number, 'pengingat_kuesioner', [
                    ':nama' => $row->name,
                    ':url' => $url,
                ]),
            ]);
    }

    /**
     * Data dashboard admin (ANL-01).
     *
     * @return array<string, mixed>
     */
    public function dashboard(): array
    {
        $active = Kuesioner::query()->active()->orderBy('end_date')->orderBy('id')->first();

        $counts = AlumniProfile::query()
            ->join('users', 'users.id', '=', 'alumni_profiles.user_id')
            ->where('users.role', 'alumni')
            ->where('users.status', AccountStatus::Active->value)
            ->whereNull('users.deleted_at')
            ->selectRaw('alumni_profiles.current_status as status, count(*) as total')
            ->groupBy('alumni_profiles.current_status')
            ->pluck('total', 'status')
            ->map(fn ($total): int => (int) $total)
            ->all();

        return [
            'stats' => [
                'total_alumni' => User::query()->alumni()->count(),
                'active_alumni' => User::query()->alumni()->active()->count(),
                'pending_verifications' => User::query()->alumni()->pending()->count(),
                'unread_messages' => Message::query()->unread()->count(),
            ],
            'activeKuesioner' => $active === null ? null : [
                'id' => $active->id,
                'title' => $active->title,
                'end_date' => $active->end_date->toDateString(),
                'summary' => $this->summary(new AnalitikFilter($active)),
            ],
            'statusDistribution' => $this->enumDistribution($counts),
            'recentAlumni' => User::query()
                ->alumni()
                ->with('profile:id,user_id,graduation_year,current_status')
                ->latest()
                ->latest('id')
                ->take(6)
                ->get()
                ->map(fn (User $user): array => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'graduation_year' => $user->profile?->graduation_year,
                    'current_status' => $user->profile?->current_status,
                    'created_at' => $user->created_at?->toIso8601String(),
                ])
                ->all(),
        ];
    }

    public function flushCache(int $kuesionerId): void
    {
        Cache::forever($this->versionKey($kuesionerId), Str::random(12));
    }

    /**
     * Populasi target (dengan left join ke respon `submitted` sebagai alias `r`).
     */
    private function population(AnalitikFilter $f): QueryBuilder
    {
        $kuesioner = $f->kuesioner;

        $query = DB::table('users')
            ->join('alumni_profiles as ap', 'ap.user_id', '=', 'users.id')
            ->leftJoin('respon_kuesioner as r', function ($join) use ($kuesioner): void {
                $join->on('r.user_id', '=', 'users.id')
                    ->where('r.kuesioner_id', '=', $kuesioner->id)
                    ->where('r.status', '=', ResponStatus::Submitted->value);
            })
            ->where('users.role', 'alumni')
            ->where(function (QueryBuilder $nested): void {
                $nested->where('users.status', AccountStatus::Active->value)->orWhereNotNull('r.id');
            });

        $targets = array_map('intval', $kuesioner->target_graduation_years ?? []);

        if ($targets !== []) {
            $query->whereIn('ap.graduation_year', $targets);
        }

        if ($f->angkatan !== []) {
            $query->whereIn('ap.graduation_year', $f->angkatan);
        }

        if ($f->gender !== null) {
            $query->where('ap.gender', $f->gender);
        }

        if ($f->major !== null) {
            $query->where('ap.major', $f->major);
        }

        return $query;
    }

    /**
     * Jawaban responden untuk satu pertanyaan (alias `j`).
     */
    private function answerQuery(AnalitikFilter $f, Pertanyaan $question): QueryBuilder
    {
        return $this->population($f)
            ->whereNotNull('r.id')
            ->join('jawaban_kuesioner as j', function ($join) use ($question): void {
                $join->on('j.respon_kuesioner_id', '=', 'r.id')->where('j.pertanyaan_id', '=', $question->id);
            })
            ->whereNotNull('j.answer')
            ->where('j.answer', '!=', '');
    }

    private function metricQuestion(AnalitikFilter $f, MetricKey $key): ?Pertanyaan
    {
        if ($f->kuesioner === null) {
            return null;
        }

        return Pertanyaan::query()
            ->where('kuesioner_id', $f->kuesioner->id)
            ->where('metric_key', $key->value)
            ->orderBy('order')
            ->first();
    }

    /**
     * @param  array<string, int>  $counts
     * @return list<array{value: string, label: string, count: int, percent: float}>
     */
    private function enumDistribution(array $counts): array
    {
        $total = 0;

        foreach (AlumniStatus::cases() as $status) {
            $total += (int) ($counts[$status->value] ?? 0);
        }

        return array_map(fn (AlumniStatus $status): array => [
            'value' => $status->value,
            'label' => $status->label(),
            'count' => (int) ($counts[$status->value] ?? 0),
            'percent' => $this->percent((int) ($counts[$status->value] ?? 0), $total),
        ], AlumniStatus::cases());
    }

    /**
     * @param  Collection<int, object>  $rows  baris `answer`, `total` untuk satu pertanyaan
     * @return array<string, mixed>
     */
    private function recapFor(AnalitikFilter $f, Pertanyaan $question, Collection $rows): array
    {
        $type = $question->question_type;
        $recap = [
            'question' => $this->presenter->question($question),
            'answered_count' => (int) $rows->sum('total'),
        ];

        if ($type->hasOptions()) {
            $counts = [];

            foreach ($rows as $row) {
                $values = $type === QuestionType::Checkbox
                    ? array_map('strval', (array) (json_decode((string) $row->answer, true) ?? []))
                    : [(string) $row->answer];

                foreach ($values as $value) {
                    $counts[$value] = ($counts[$value] ?? 0) + (int) $row->total;
                }
            }

            $recap['options'] = array_map(fn (array $option): array => [
                'value' => (string) $option['value'],
                'label' => (string) $option['label'],
                'count' => $counts[(string) $option['value']] ?? 0,
                'percent' => $this->percent($counts[(string) $option['value']] ?? 0, $recap['answered_count']),
            ], array_values($question->options ?? []));
        }

        if ($type === QuestionType::Number || $type === QuestionType::Rating) {
            $values = [];

            foreach ($rows as $row) {
                foreach ($this->numericValues([$row->answer]) as $value) {
                    array_push($values, ...array_fill(0, (int) $row->total, $value));
                }
            }

            $recap['stats'] = $values === []
                ? ['mean' => null, 'median' => null, 'min' => null, 'max' => null]
                : [
                    'mean' => round(array_sum($values) / count($values), 1),
                    'median' => round($this->median($values), 1),
                    'min' => min($values),
                    'max' => max($values),
                ];
        }

        if ($type === QuestionType::Rating) {
            $recap['distribution'] = array_map(fn (int $score): array => [
                'score' => $score,
                'count' => (int) ($rows->first(fn (object $row): bool => (string) $row->answer === (string) $score)->total ?? 0),
            ], range(1, 5));
        }

        if ($type === QuestionType::Text || $type === QuestionType::Textarea) {
            $recap['texts'] = $this->answerQuery($f, $question)
                ->orderByDesc('j.id')
                ->limit(self::TEXT_LIMIT)
                ->pluck('j.answer')
                ->all();
            $recap['texts_total'] = $recap['answered_count'];
        }

        return $recap;
    }

    /**
     * @param  list<mixed>  $answers
     * @return list<float|int>
     */
    private function numericValues(array $answers): array
    {
        $values = [];

        foreach ($answers as $answer) {
            if (is_numeric($answer)) {
                $values[] = $answer + 0;
            }
        }

        return $values;
    }

    /**
     * @param  list<float|int>  $values
     */
    private function median(array $values): float
    {
        sort($values);
        $count = count($values);
        $middle = intdiv($count, 2);

        return $count % 2 === 1 ? (float) $values[$middle] : ($values[$middle - 1] + $values[$middle]) / 2;
    }

    private function percent(int $part, int $total): float
    {
        return $total === 0 ? 0.0 : round($part / $total * 100, 1);
    }

    private function versionKey(int $kuesionerId): string
    {
        return "analitik:version:{$kuesionerId}";
    }

    /**
     * @template T
     *
     * @param  Closure(): T  $callback
     * @return T
     */
    private function cached(AnalitikFilter $f, string $name, Closure $callback): mixed
    {
        if ($f->kuesioner === null) {
            return $callback();
        }

        $version = Cache::get($this->versionKey($f->kuesioner->id), '0');

        return Cache::remember(
            "analitik:{$f->kuesioner->id}:{$version}:{$name}:{$f->cacheKey()}",
            self::CACHE_TTL_SECONDS,
            $callback,
        );
    }
}
