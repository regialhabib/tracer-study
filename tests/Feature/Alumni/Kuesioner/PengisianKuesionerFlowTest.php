<?php

namespace Tests\Feature\Alumni\Kuesioner;

use App\Enums\MetricKey;
use App\Enums\ResponStatus;
use App\Models\AlumniProfile;
use App\Models\Kuesioner;
use App\Models\Pertanyaan;
use App\Models\ResponKuesioner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PengisianKuesionerFlowTest extends TestCase
{
    use RefreshDatabase;

    private User $alumni;

    private Kuesioner $kuesioner;

    private Pertanyaan $status;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();

        $this->alumni = User::factory()->alumni()->create();
        AlumniProfile::factory()->create(['user_id' => $this->alumni->id, 'graduation_year' => 2023, 'current_status' => 'lainnya']);

        $this->kuesioner = Kuesioner::factory()->create();
        $this->status = Pertanyaan::factory()->metric(MetricKey::StatusKegiatan)->create([
            'kuesioner_id' => $this->kuesioner->id,
            'section' => 'Aktivitas',
            'order' => 1,
        ]);
    }

    private function answerStatus(string $value): void
    {
        $this->actingAs($this->alumni)->putJson(route('alumni.kuesioner.draft', $this->kuesioner), [
            'section' => 'Aktivitas',
            'answers' => [$this->status->id => $value],
        ])->assertOk();
    }

    private function currentStatus(): string
    {
        $status = $this->alumni->profile()->first()->current_status;

        return $status instanceof \BackedEnum ? $status->value : (string) $status;
    }

    public function test_summary_lists_incomplete_sections(): void
    {
        $this->actingAs($this->alumni)->get(route('alumni.kuesioner.summary', $this->kuesioner))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Alumni/Kuesioner/Summary')
                ->where('incompleteSections.0.name', 'Aktivitas')
                ->where('incompleteSections.0.count', 1));
    }

    public function test_submit_is_rejected_while_required_questions_are_empty(): void
    {
        $this->actingAs($this->alumni)->post(route('alumni.kuesioner.submit', $this->kuesioner))
            ->assertRedirect(route('alumni.kuesioner.summary', $this->kuesioner))
            ->assertSessionHas('error');

        $this->assertDatabaseMissing('respon_kuesioner', ['status' => ResponStatus::Submitted->value]);
    }

    public function test_submit_marks_respon_submitted_and_syncs_current_status(): void
    {
        $this->answerStatus('wirausaha');

        $this->actingAs($this->alumni)->post(route('alumni.kuesioner.submit', $this->kuesioner))
            ->assertRedirect(route('alumni.kuesioner.done', $this->kuesioner));

        $respon = ResponKuesioner::where('user_id', $this->alumni->id)->firstOrFail();
        $this->assertSame(ResponStatus::Submitted, $respon->status);
        $this->assertNotNull($respon->submitted_at);
        $this->assertSame('wirausaha', $this->currentStatus());

        $this->actingAs($this->alumni)->get(route('alumni.kuesioner.done', $this->kuesioner))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Alumni/Kuesioner/Done'));
    }

    public function test_done_redirects_to_form_when_not_submitted(): void
    {
        $this->actingAs($this->alumni)->get(route('alumni.kuesioner.done', $this->kuesioner))
            ->assertRedirect(route('alumni.kuesioner.show', $this->kuesioner));
    }

    public function test_revision_keeps_submitted_status_and_resubmit_updates_current_status(): void
    {
        $this->answerStatus('bekerja');
        $this->actingAs($this->alumni)->post(route('alumni.kuesioner.submit', $this->kuesioner));

        $this->answerStatus('mencari_kerja');
        $this->assertSame(ResponStatus::Submitted, ResponKuesioner::firstOrFail()->status);

        $this->actingAs($this->alumni)->post(route('alumni.kuesioner.submit', $this->kuesioner))
            ->assertRedirect(route('alumni.kuesioner.done', $this->kuesioner));

        $this->assertSame('mencari_kerja', $this->currentStatus());
    }

    public function test_revision_is_rejected_after_kuesioner_closed(): void
    {
        $this->answerStatus('bekerja');
        $this->actingAs($this->alumni)->post(route('alumni.kuesioner.submit', $this->kuesioner));

        $this->kuesioner->update(['status' => 'closed']);

        $this->actingAs($this->alumni)->get(route('alumni.kuesioner.show', $this->kuesioner))
            ->assertRedirect(route('alumni.kuesioner.index'));
        $this->actingAs($this->alumni)->post(route('alumni.kuesioner.submit', $this->kuesioner))
            ->assertRedirect(route('alumni.kuesioner.index'));
    }

    public function test_admin_alumni_detail_lists_kuesioner_history_without_answers(): void
    {
        $admin = User::factory()->admin()->create();
        $this->answerStatus('bekerja');
        $this->actingAs($this->alumni)->post(route('alumni.kuesioner.submit', $this->kuesioner));

        $this->actingAs($admin)->get(route('admin.alumni.show', $this->alumni->id))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('alumni.riwayat_kuesioner', 1)
                ->where('alumni.riwayat_kuesioner.0.title', $this->kuesioner->title)
                ->where('alumni.riwayat_kuesioner.0.status', 'submitted')
                ->missing('alumni.riwayat_kuesioner.0.answers'));
    }
}
