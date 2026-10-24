<?php

namespace Tests\Feature\Alumni\Kuesioner;

use App\Enums\QuestionType;
use App\Enums\ResponStatus;
use App\Models\AlumniProfile;
use App\Models\JawabanKuesioner;
use App\Models\Kuesioner;
use App\Models\Pertanyaan;
use App\Models\ResponKuesioner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PengisianKuesionerTest extends TestCase
{
    use RefreshDatabase;

    private User $alumni;

    private Kuesioner $kuesioner;

    /** Pertanyaan bagian "Aktivitas": status (radio) dan lembaga (text, hanya bila status = bekerja). */
    private Pertanyaan $status;

    private Pertanyaan $lembaga;

    private Pertanyaan $kepuasan;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();

        $this->alumni = User::factory()->alumni()->create();
        AlumniProfile::factory()->create(['user_id' => $this->alumni->id, 'graduation_year' => 2023]);

        $this->kuesioner = Kuesioner::factory()->create();
        $this->status = Pertanyaan::factory()->create([
            'kuesioner_id' => $this->kuesioner->id,
            'section' => 'Aktivitas',
            'order' => 1,
            'options' => [['value' => 'bekerja', 'label' => 'Bekerja'], ['value' => 'kuliah_umum', 'label' => 'Kuliah']],
        ]);
        $this->lembaga = Pertanyaan::factory()->type(QuestionType::Text)->dependsOn($this->status, 'bekerja')->create([
            'kuesioner_id' => $this->kuesioner->id,
            'section' => 'Aktivitas',
            'order' => 2,
        ]);
        $this->kepuasan = Pertanyaan::factory()->type(QuestionType::Rating)->create([
            'kuesioner_id' => $this->kuesioner->id,
            'section' => 'Penilaian',
            'order' => 3,
        ]);
    }

    private function saveDraft(array $answers, string $section = 'Aktivitas', bool $validate = false, ?User $user = null)
    {
        return $this->actingAs($user ?? $this->alumni)->putJson(
            route('alumni.kuesioner.draft', $this->kuesioner),
            ['section' => $section, 'answers' => $answers, 'validate' => $validate],
        );
    }

    public function test_index_lists_only_kuesioner_for_target_year_in_period(): void
    {
        Kuesioner::factory()->create(['target_graduation_years' => [2019]]);
        Kuesioner::factory()->draft()->create();

        $this->actingAs($this->alumni)->get(route('alumni.kuesioner.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Alumni/Kuesioner/Index')
                ->has('kuesionerList', 1)
                ->where('kuesionerList.0.id', $this->kuesioner->id)
                ->where('kuesionerList.0.respon_status', null)
                ->where('kuesionerList.0.action', 'Mulai'));
    }

    public function test_show_creates_draft_respon_and_exposes_sections(): void
    {
        $this->actingAs($this->alumni)->get(route('alumni.kuesioner.show', $this->kuesioner))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Alumni/Kuesioner/Show')
                ->has('sections', 2)
                ->where('currentSectionIndex', 0)
                ->where('respon.status', 'draft'));

        $this->assertDatabaseHas('respon_kuesioner', [
            'kuesioner_id' => $this->kuesioner->id,
            'user_id' => $this->alumni->id,
            'status' => ResponStatus::Draft->value,
        ]);
    }

    public function test_show_redirects_when_kuesioner_is_closed_or_other_year(): void
    {
        $closed = Kuesioner::factory()->closed()->create();
        $otherYear = Kuesioner::factory()->create(['target_graduation_years' => [2019]]);

        $this->actingAs($this->alumni)->get(route('alumni.kuesioner.show', $closed))
            ->assertRedirect(route('alumni.kuesioner.index'))
            ->assertSessionHas('error');
        $this->actingAs($this->alumni)->get(route('alumni.kuesioner.show', $otherYear))
            ->assertRedirect(route('alumni.kuesioner.index'))
            ->assertSessionHas('error');
        $this->assertDatabaseCount('respon_kuesioner', 0);
    }

    public function test_saved_draft_is_restored_with_answers_and_section(): void
    {
        $this->saveDraft([$this->status->id => 'bekerja', $this->lembaga->id => 'PT Maju'])->assertOk();
        $this->saveDraft([$this->kepuasan->id => 4], 'Penilaian')->assertOk()->assertJsonPath('current_section', 'Penilaian');

        $this->actingAs($this->alumni)->get(route('alumni.kuesioner.show', $this->kuesioner))
            ->assertInertia(fn (Assert $page) => $page
                ->where('currentSectionIndex', 1)
                ->where('answers.'.$this->status->id, 'bekerja')
                ->where('answers.'.$this->lembaga->id, 'PT Maju')
                ->where('answers.'.$this->kepuasan->id, 4));
    }

    public function test_draft_is_idempotent_and_empty_value_removes_answer(): void
    {
        $this->saveDraft([$this->status->id => 'bekerja'])->assertOk();
        $this->saveDraft([$this->status->id => 'bekerja'])->assertOk();
        $this->assertSame(1, JawabanKuesioner::count());

        $this->saveDraft([$this->status->id => null])->assertOk();
        $this->assertSame(0, JawabanKuesioner::count());
    }

    public function test_validate_rejects_empty_required_and_invalid_values(): void
    {
        $this->saveDraft([$this->status->id => null], validate: true)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(["answers.{$this->status->id}"]);

        $this->saveDraft([$this->status->id => 'bukan_opsi'], validate: true)->assertUnprocessable();

        $this->saveDraft([$this->kepuasan->id => 9], 'Penilaian', validate: true)->assertUnprocessable();
        $this->saveDraft([$this->kepuasan->id => 5], 'Penilaian', validate: true)->assertOk();
    }

    public function test_hidden_conditional_question_is_not_validated_and_answer_is_removed(): void
    {
        $this->saveDraft([$this->status->id => 'bekerja', $this->lembaga->id => 'PT Maju'])->assertOk();
        $this->assertDatabaseHas('jawaban_kuesioner', ['pertanyaan_id' => $this->lembaga->id]);

        $this->saveDraft([$this->status->id => 'kuliah_umum'], validate: true)->assertOk();

        $this->assertDatabaseMissing('jawaban_kuesioner', ['pertanyaan_id' => $this->lembaga->id]);
    }

    public function test_visible_conditional_required_question_is_validated(): void
    {
        $this->saveDraft([$this->status->id => 'bekerja', $this->lembaga->id => null], validate: true)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(["answers.{$this->lembaga->id}"]);
    }

    public function test_draft_rejects_unknown_section_and_unavailable_kuesioner(): void
    {
        $this->saveDraft([], 'Tidak Ada')->assertUnprocessable()->assertJsonValidationErrors(['section']);

        $this->kuesioner->update(['status' => 'closed']);
        $this->saveDraft([$this->status->id => 'bekerja'])->assertForbidden();
    }

    public function test_draft_does_not_touch_other_users_respon(): void
    {
        $other = User::factory()->alumni()->create();
        AlumniProfile::factory()->create(['user_id' => $other->id, 'graduation_year' => 2023]);

        $this->saveDraft([$this->status->id => 'bekerja'], user: $other)->assertOk();

        $this->assertSame(1, ResponKuesioner::where('user_id', $other->id)->count());
        $this->assertSame(0, ResponKuesioner::where('user_id', $this->alumni->id)->count());
    }

    public function test_admin_cannot_access_alumni_kuesioner_routes(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->get(route('alumni.kuesioner.index'))->assertForbidden();
        $this->actingAs($admin)->get(route('alumni.kuesioner.show', $this->kuesioner))->assertForbidden();
        $this->saveDraft([], user: $admin)->assertForbidden();
    }
}
