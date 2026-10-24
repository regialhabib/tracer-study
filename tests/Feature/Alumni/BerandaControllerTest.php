<?php

namespace Tests\Feature\Alumni;

use App\Models\Berita;
use App\Models\JawabanKuesioner;
use App\Models\Kuesioner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BerandaControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_beranda_renders_active_kuesioner_unfilled_and_latest_three_berita(): void
    {
        $user = User::factory()->alumni()->create();
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
            ->has('beritaList', 3)
        );
    }

    public function test_beranda_marks_kuesioner_filled_when_user_has_answers(): void
    {
        $user = User::factory()->alumni()->create();
        $kuesioner = Kuesioner::factory()->create();
        JawabanKuesioner::factory()->create(['kuesioner_id' => $kuesioner->id, 'user_id' => $user->id]);

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertInertia(fn (Assert $page) => $page->where('hasFilled', true));
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
