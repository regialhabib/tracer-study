<?php

namespace Tests\Feature\Admin\Analitik;

use App\Enums\AccountStatus;
use App\Enums\MetricKey;
use App\Enums\QuestionType;
use App\Enums\ResponStatus;
use App\Models\AlumniProfile;
use App\Models\JawabanKuesioner;
use App\Models\Kuesioner;
use App\Models\Pertanyaan;
use App\Models\ResponKuesioner;
use App\Models\User;
use App\Services\Admin\Analitik\AnalitikFilter;
use App\Services\Admin\Analitik\AnalitikService;
use App\Services\Alumni\PengisianKuesionerService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AnalitikServiceTest extends TestCase
{
    use RefreshDatabase;

    private Kuesioner $kuesioner;

    /** @var array<string, Pertanyaan> */
    private array $q = [];

    private AnalitikService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = app(AnalitikService::class);
        $this->kuesioner = Kuesioner::factory()->forAllGraduationYears()->create();

        $order = 1;
        foreach ([
            'status' => MetricKey::StatusKegiatan,
            'masa' => MetricKey::MasaTungguBulan,
            'income' => MetricKey::RentangPendapatan,
            'lembaga' => MetricKey::NamaLembaga,
            'relevansi' => MetricKey::RelevansiIlmu,
        ] as $name => $key) {
            $this->q[$name] = Pertanyaan::factory()->metric($key)->create(['kuesioner_id' => $this->kuesioner->id, 'order' => $order++]);
        }

        $this->q['skills'] = Pertanyaan::factory()->type(QuestionType::Checkbox)->create([
            'kuesioner_id' => $this->kuesioner->id,
            'order' => $order,
            'options' => [['value' => 'a', 'label' => 'Opsi A'], ['value' => 'b', 'label' => 'Opsi B']],
        ]);
    }

    /**
     * @param  array<string, mixed>  $user
     * @param  array<string, mixed>  $profile
     */
    private function alumni(int $year, string $gender, string $major, array $user = [], array $profile = []): User
    {
        $account = User::factory()->alumni()->create($user);
        AlumniProfile::factory()->create(array_merge(['user_id' => $account->id, 'graduation_year' => $year, 'gender' => $gender, 'major' => $major, 'phone_number' => null], $profile));

        return $account;
    }

    /**
     * @param  array<string, string>  $answers
     */
    private function respond(User $user, array $answers, bool $submitted = true): ResponKuesioner
    {
        $respon = ResponKuesioner::factory()->create([
            'kuesioner_id' => $this->kuesioner->id,
            'user_id' => $user->id,
            'status' => $submitted ? ResponStatus::Submitted : ResponStatus::Draft,
            'submitted_at' => $submitted ? now() : null,
        ]);

        foreach ($answers as $name => $answer) {
            JawabanKuesioner::factory()->forRespon($respon)->create([
                'pertanyaan_id' => $this->q[$name]->id,
                'answer' => $answer,
            ]);
        }

        return $respon;
    }

    private function seedScenario(): void
    {
        $a = $this->alumni(2023, 'L', 'IPA');
        $b = $this->alumni(2023, 'P', 'IPA');
        $c = $this->alumni(2024, 'L', 'IPS');
        $d = $this->alumni(2024, 'P', 'IPS');
        $e = $this->alumni(2024, 'L', 'IPA');
        $this->alumni(2023, 'P', 'IPA', [], ['phone_number' => '081234567890']);
        $this->alumni(2023, 'L', 'IPA', ['status' => AccountStatus::Inactive]);
        $h = $this->alumni(2023, 'L', 'IPA', ['status' => AccountStatus::Inactive]);

        $this->respond($a, ['status' => 'bekerja', 'masa' => '2', 'income' => '1_3jt', 'lembaga' => 'PT Maju', 'relevansi' => '5', 'skills' => '["a","b"]']);
        $this->respond($b, ['status' => 'bekerja', 'masa' => '5', 'income' => '3_5jt', 'lembaga' => ' pt maju ', 'relevansi' => '3', 'skills' => '["a"]']);
        $this->respond($c, ['status' => 'kuliah_umum', 'masa' => '10', 'income' => 'gt_5jt', 'lembaga' => 'UGM', 'relevansi' => '4']);
        $this->respond($d, ['status' => 'wirausaha', 'masa' => '14', 'income' => 'lt_1jt', 'lembaga' => 'PT Maju', 'relevansi' => '4']);
        $this->respond($e, ['status' => 'bekerja', 'masa' => '1'], false);
        $this->respond($h, ['status' => 'lainnya', 'masa' => '20', 'relevansi' => '1']);
    }

    /**
     * @param  array<string, mixed>  $override
     */
    private function filter(array $override = []): AnalitikFilter
    {
        return new AnalitikFilter($this->kuesioner, $override['angkatan'] ?? [], $override['gender'] ?? null, $override['major'] ?? null);
    }

    public function test_summary_counts_population_and_ignores_drafts_and_inactive_without_response(): void
    {
        $this->seedScenario();

        $this->assertSame(
            ['target_count' => 7, 'submitted_count' => 5, 'draft_count' => 1, 'response_rate' => 71.4],
            $this->service->summary($this->filter()),
        );
    }

    public function test_response_rate_by_angkatan(): void
    {
        $this->seedScenario();

        $this->assertSame([
            ['angkatan' => 2023, 'target' => 4, 'submitted' => 3, 'rate' => 75.0],
            ['angkatan' => 2024, 'target' => 3, 'submitted' => 2, 'rate' => 66.7],
        ], $this->service->responseRateByAngkatan($this->filter()));
    }

    public function test_filters_change_results(): void
    {
        $this->seedScenario();

        $byAngkatan = $this->service->summary($this->filter(['angkatan' => [2023]]));
        $byGender = $this->service->summary($this->filter(['gender' => 'P']));
        $byMajor = $this->service->summary($this->filter(['major' => 'IPS']));

        $this->assertSame([4, 3], [$byAngkatan['target_count'], $byAngkatan['submitted_count']]);
        $this->assertSame([3, 2], [$byGender['target_count'], $byGender['submitted_count']]);
        $this->assertSame([2, 2], [$byMajor['target_count'], $byMajor['submitted_count']]);
    }

    public function test_status_distribution_lists_all_statuses_in_enum_order(): void
    {
        $this->seedScenario();

        $result = $this->service->statusDistribution($this->filter());
        $byValue = collect($result)->keyBy('value');

        $this->assertCount(7, $result);
        $this->assertSame('pengabdian', $result[0]['value']);
        $this->assertSame('lainnya', $result[6]['value']);
        $this->assertSame(0, $byValue['pengabdian']['count']);
        $this->assertSame(2, $byValue['bekerja']['count']);
        $this->assertSame(40.0, $byValue['bekerja']['percent']);
        $this->assertSame(1, $byValue['wirausaha']['count']);
        $this->assertSame(1, $byValue['kuliah_umum']['count']);
        $this->assertSame(1, $byValue['lainnya']['count']);
    }

    public function test_masa_tunggu_mean_median_and_buckets(): void
    {
        $this->seedScenario();

        $result = $this->service->masaTunggu($this->filter());

        $this->assertSame(5, $result['count']);
        $this->assertSame(10.2, $result['mean']);
        $this->assertSame(10.0, $result['median']);
        $this->assertSame([1, 1, 1, 2], array_column($result['distribution'], 'count'));
        $this->assertSame(['0–3 bln', '4–6 bln', '7–12 bln', '> 12 bln'], array_column($result['distribution'], 'label'));
    }

    public function test_pendapatan_only_counts_working_respondents_in_preset_order(): void
    {
        $this->seedScenario();

        $result = $this->service->pendapatan($this->filter());

        $this->assertSame(['lt_1jt', '1_3jt', '3_5jt', 'gt_5jt'], array_column($result, 'value'));
        $this->assertSame([1, 1, 1, 0], array_column($result, 'count'));
        $this->assertSame(33.3, $result[0]['percent']);
    }

    public function test_top_lembaga_normalizes_names(): void
    {
        $this->seedScenario();

        $this->assertSame([
            ['name' => 'PT Maju', 'count' => 3],
            ['name' => 'UGM', 'count' => 1],
        ], $this->service->topLembaga($this->filter()));
        $this->assertCount(1, $this->service->topLembaga($this->filter(), 1));
    }

    public function test_relevansi_ilmu(): void
    {
        $this->seedScenario();

        $result = $this->service->relevansiIlmu($this->filter());

        $this->assertSame(5, $result['count']);
        $this->assertSame(3.4, $result['mean']);
        $this->assertSame([1, 0, 1, 2, 1], array_column($result['distribution'], 'count'));
    }

    public function test_question_recap_parses_checkbox_and_reports_rating_stats(): void
    {
        $this->seedScenario();

        $recap = collect($this->service->questionRecap($this->filter()))->keyBy(fn ($row) => $row['question']['id']);

        $skills = $recap[$this->q['skills']->id];
        $this->assertSame(2, $skills['answered_count']);
        $this->assertSame([2, 1], array_column($skills['options'], 'count'));
        $this->assertSame([100.0, 50.0], array_column($skills['options'], 'percent'));

        $relevansi = $recap[$this->q['relevansi']->id];
        $this->assertSame(['mean' => 3.4, 'median' => 4.0, 'min' => 1, 'max' => 5], $relevansi['stats']);

        $lembaga = $recap[$this->q['lembaga']->id];
        $this->assertSame(4, $lembaga['texts_total']);
        $this->assertCount(4, $lembaga['texts']);
        $this->assertCount(6, $recap);
    }

    public function test_non_respondents_are_active_accounts_without_submitted_response(): void
    {
        $this->seedScenario();

        $result = $this->service->nonRespondents($this->filter());

        $this->assertCount(2, $result);
        $withPhone = $result->firstWhere('phone_number', '081234567890');
        $this->assertSame(2023, $withPhone['angkatan']);
        $this->assertStringContainsString('wa.me/6281234567890', $withPhone['whatsapp_url']);
        $this->assertNull($result->firstWhere('phone_number', null)['whatsapp_url']);
    }

    public function test_metrics_return_null_when_question_is_missing(): void
    {
        $empty = Kuesioner::factory()->forAllGraduationYears()->create();
        $filter = new AnalitikFilter($empty);

        $this->assertNull($this->service->statusDistribution($filter));
        $this->assertNull($this->service->masaTunggu($filter));
        $this->assertNull($this->service->pendapatan($filter));
        $this->assertNull($this->service->topLembaga($filter));
        $this->assertNull($this->service->relevansiIlmu($filter));
        $this->assertSame(0, $this->service->summary($filter)['target_count']);
    }

    public function test_cache_is_flushed_when_response_is_submitted(): void
    {
        $user = $this->alumni(2023, 'L', 'IPA');
        $filter = $this->filter();

        $this->assertSame(0, $this->service->summary($filter)['submitted_count']);

        $pengisian = app(PengisianKuesionerService::class);
        $respon = $pengisian->startOrResume($user, $this->kuesioner);
        $answers = [];
        foreach ($this->q as $name => $question) {
            $answers[$question->id] = match ($name) {
                'status' => 'pengabdian',
                'masa' => 3,
                'income' => '1_3jt',
                'lembaga' => 'Pondok',
                'relevansi' => 4,
                default => ['a'],
            };
        }
        $pengisian->saveDraft($respon, $this->kuesioner, $this->q['status']->sectionName(), $answers, false);

        $this->assertSame(0, $this->service->summary($filter)['submitted_count']);
        $this->assertSame([], $pengisian->submit($respon->refresh(), $this->kuesioner));
        $this->assertSame(1, $this->service->summary($filter)['submitted_count']);
    }

    public function test_aggregation_is_fast_for_large_population(): void
    {
        $now = now()->toDateTimeString();
        $hash = bcrypt('password');
        $users = [];

        for ($i = 1; $i <= 500; $i++) {
            $users[] = ['name' => "Alumni $i", 'nisn' => sprintf('99%08d', $i), 'email' => "bulk$i@example.test", 'password' => $hash, 'role' => 'alumni', 'status' => 'active', 'first_login' => false, 'created_at' => $now, 'updated_at' => $now];
        }
        foreach (array_chunk($users, 100) as $chunk) {
            DB::table('users')->insert($chunk);
        }

        $ids = User::where('email', 'like', 'bulk%')->orderBy('id')->pluck('id')->values();
        $profiles = $ids->map(fn ($id, $index) => ['user_id' => $id, 'gender' => $index % 2 ? 'L' : 'P', 'entry_year' => 2020, 'graduation_year' => 2022 + $index % 3, 'major' => 'IPA', 'current_status' => 'bekerja', 'created_at' => $now, 'updated_at' => $now])->all();
        foreach (array_chunk($profiles, 100) as $chunk) {
            DB::table('alumni_profiles')->insert($chunk);
        }

        $responses = $ids->take(300)->map(fn ($id) => ['kuesioner_id' => $this->kuesioner->id, 'user_id' => $id, 'status' => 'submitted', 'submitted_at' => $now, 'created_at' => $now, 'updated_at' => $now])->all();
        foreach (array_chunk($responses, 100) as $chunk) {
            DB::table('respon_kuesioner')->insert($chunk);
        }

        $answers = [];
        foreach (ResponKuesioner::orderBy('id')->get() as $respon) {
            foreach (['status' => 'bekerja', 'masa' => '4', 'lembaga' => 'PT Maju'] as $name => $answer) {
                $answers[] = ['respon_kuesioner_id' => $respon->id, 'kuesioner_id' => $this->kuesioner->id, 'user_id' => $respon->user_id, 'pertanyaan_id' => $this->q[$name]->id, 'answer' => $answer, 'created_at' => $now, 'updated_at' => $now];
            }
        }
        foreach (array_chunk($answers, 100) as $chunk) {
            DB::table('jawaban_kuesioner')->insert($chunk);
        }

        $filter = $this->filter();
        $start = microtime(true);
        $this->service->summary($filter);
        $this->service->responseRateByAngkatan($filter);
        $this->service->statusDistribution($filter);
        $this->service->masaTunggu($filter);
        $this->service->pendapatan($filter);
        $this->service->topLembaga($filter);
        $this->service->relevansiIlmu($filter);
        $this->service->questionRecap($filter);
        $this->service->nonRespondents($filter);

        $this->assertLessThan(2.0, microtime(true) - $start);
        $this->assertSame(300, $this->service->summary($filter)['submitted_count']);
    }
}
