<?php

namespace Tests\Feature\Alumni;

use App\Models\AlumniProfile;
use App\Models\Berita;
use App\Models\Kuesioner;
use App\Models\ResponKuesioner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BerandaControllerTest extends TestCase
{
    use RefreshDatabase;

    private function alumniLulusan(int $graduationYear = 2023): User
    {
        $user = User::factory()->alumni()->create();
        AlumniProfile::factory()->create(['user_id' => $user->id, 'graduation_year' => $graduationYear]);

        return $user;
    }

    public function test_beranda_renders_active_kuesioner_unfilled_and_latest_three_berita(): void
    {
        $user = $this->alumniLulusan();
        $kuesioner = Kuesioner::factory()->create();
        Kuesioner::factory()->inactive()->create();
        Berita::factory()->count(4)->create();
        Berita::factory()->draft()->create();

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->where('activeKuesioner.id', $kuesioner->id)
            ->has('activeKuesioner.pertanyaan_count')
            ->where('hasFilled', false)
            ->where('kuesionerList.0.id', $kuesioner->id)
            ->where('kuesionerList.0.action', 'Mulai')
            ->has('beritaList', 3)
        );
    }

    public function test_beranda_includes_nearest_upcoming_agenda(): void
    {
        $user = $this->alumniLulusan();
        Berita::factory()->agenda()->create(['event_date' => now()->addDays(30)]);
        $terdekat = Berita::factory()->agenda()->create(['event_date' => now()->addDays(5)]);
        Berita::factory()->agenda()->create(['event_date' => now()->subDays(2)]);
        Berita::factory()->agenda()->draft()->create(['event_date' => now()->addDay()]);

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertInertia(fn (Assert $page) => $page
            ->where('agendaTerdekat.id', $terdekat->id)
            ->missing('agendaTerdekat.content')
        );
    }

    public function test_beranda_has_no_agenda_when_none_upcoming(): void
    {
        $user = $this->alumniLulusan();

        $this->actingAs($user)->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page->where('agendaTerdekat', null));
    }

    public function test_beranda_marks_kuesioner_filled_when_response_submitted(): void
    {
        $user = $this->alumniLulusan();
        $kuesioner = Kuesioner::factory()->create();
        ResponKuesioner::factory()->submitted()->create(['kuesioner_id' => $kuesioner->id, 'user_id' => $user->id]);

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertInertia(fn (Assert $page) => $page
            ->where('hasFilled', true)
            ->where('kuesionerList.0.respon_status', 'submitted')
            ->where('kuesionerList.0.action', 'Revisi'));
    }

    public function test_beranda_hides_kuesioner_outside_target_or_period(): void
    {
        $user = $this->alumniLulusan(2019);
        Kuesioner::factory()->create(['target_graduation_years' => [2023]]);
        Kuesioner::factory()->forAllGraduationYears()->create(['start_date' => now()->addDay(), 'end_date' => now()->addDays(30)]);
        Kuesioner::factory()->draft()->forAllGraduationYears()->create();

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertInertia(fn (Assert $page) => $page->where('activeKuesioner', null));
    }

    public function test_beranda_renders_without_active_kuesioner(): void
    {
        $user = User::factory()->alumni()->create();

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertInertia(fn (Assert $page) => $page
            ->where('activeKuesioner', null)
            ->where('hasFilled', false)
            ->has('beritaList', 0)
        );
    }

    public function test_admin_is_redirected_to_admin_dashboard(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get(route('dashboard'));

        $response->assertRedirect(route('admin.dashboard'));
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $response = $this->get(route('dashboard'));

        $response->assertRedirect(route('login'));
    }
}
