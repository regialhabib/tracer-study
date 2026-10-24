<?php

namespace Tests\Feature\Admin\Analitik;

use App\Models\AlumniProfile;
use App\Models\Kuesioner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AnalitikPageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_index_renders_all_props_for_admin(): void
    {
        $kuesioner = Kuesioner::factory()->forAllGraduationYears()->create();
        $alumni = User::factory()->alumni()->create();
        AlumniProfile::factory()->create(['user_id' => $alumni->id, 'graduation_year' => 2023]);

        $this->actingAs(User::factory()->admin()->create())
            ->get(route('admin.analitik.index', ['kuesioner' => $kuesioner->id, 'angkatan' => [2023]]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Analitik/Index')
                ->where('filters.kuesioner', $kuesioner->id)
                ->where('filters.angkatan', [2023])
                ->where('kuesioner.id', $kuesioner->id)
                ->where('summary.target_count', 1)
                ->where('summary.submitted_count', 0)
                ->has('filterOptions.kuesioner', 1)
                ->has('responseRateByAngkatan', 1)
                ->where('statusDistribution', null)
                ->where('masaTunggu', null)
                ->where('pendapatan', null)
                ->where('topLembaga', null)
                ->where('relevansiIlmu', null)
                ->where('nonRespondents.total', 1)
                ->has('nonRespondents.items', 1));
    }

    public function test_index_shows_empty_state_props_without_kuesioner(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->get(route('admin.analitik.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Analitik/Index')
                ->where('kuesioner', null)
                ->where('summary.target_count', 0)
                ->where('responseRateByAngkatan', [])
                ->where('statusDistribution', null)
                ->where('nonRespondents.total', 0)
                ->where('nonRespondents.items', []));
    }

    public function test_pertanyaan_renders_recap(): void
    {
        $kuesioner = Kuesioner::factory()->forAllGraduationYears()->create();

        $this->actingAs(User::factory()->admin()->create())
            ->get(route('admin.analitik.pertanyaan', ['kuesioner' => $kuesioner->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Analitik/Pertanyaan')
                ->where('kuesioner.id', $kuesioner->id)
                ->has('filterOptions')
                ->where('questions', []));
    }

    public function test_alumni_cannot_access_analitik(): void
    {
        $alumni = User::factory()->alumni()->create();

        $this->actingAs($alumni)->get(route('admin.analitik.index'))->assertForbidden();
        $this->actingAs($alumni)->get(route('admin.analitik.pertanyaan'))->assertForbidden();
    }
}
