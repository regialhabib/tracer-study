<?php

namespace Tests\Feature\Admin;

use App\Models\AlumniProfile;
use App\Models\Kuesioner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_dashboard_renders_stats_active_kuesioner_and_distribution(): void
    {
        $kuesioner = Kuesioner::factory()->forAllGraduationYears()->create();

        foreach (['bekerja', 'bekerja', 'kuliah_umum'] as $status) {
            $user = User::factory()->alumni()->create();
            AlumniProfile::factory()->create(['user_id' => $user->id, 'current_status' => $status]);
        }
        User::factory()->alumni()->pending()->create();

        $this->actingAs(User::factory()->admin()->create())
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Dashboard')
                ->where('stats.total_alumni', 4)
                ->where('stats.active_alumni', 3)
                ->where('stats.pending_verifications', 1)
                ->where('stats.unread_messages', 0)
                ->where('activeKuesioner.id', $kuesioner->id)
                ->where('activeKuesioner.summary.target_count', 3)
                ->has('statusDistribution', 7)
                ->where('statusDistribution.3.value', 'bekerja')
                ->where('statusDistribution.3.count', 2)
                ->has('recentAlumni', 4)
                ->has('recentAlumni.0', fn (Assert $row) => $row
                    ->hasAll(['id', 'name', 'graduation_year', 'current_status', 'created_at'])));
    }

    public function test_dashboard_without_active_kuesioner(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('activeKuesioner', null)
                ->where('recentAlumni', []));
    }

    public function test_alumni_cannot_open_admin_dashboard(): void
    {
        $this->actingAs(User::factory()->alumni()->create())
            ->get(route('admin.dashboard'))
            ->assertForbidden();
    }
}
