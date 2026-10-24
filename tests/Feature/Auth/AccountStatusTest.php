<?php

namespace Tests\Feature\Auth;

use App\Models\AlumniProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AccountStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_pending_user_logs_in_and_is_redirected_to_pending_page(): void
    {
        $user = User::factory()->alumni()->pending()->create(['nisn' => '0051230001']);

        $response = $this->post('/login', ['login' => '0051230001', 'password' => 'password']);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('verification.pending'));
    }

    public function test_inactive_user_login_is_rejected_with_rejection_reason(): void
    {
        User::factory()->alumni()->inactive('NISN tidak ditemukan di arsip kelulusan.')->create(['nisn' => '0051230002']);

        $response = $this->from('/login')->post('/login', ['login' => '0051230002', 'password' => 'password']);

        $response->assertRedirect('/login');
        $response->assertSessionHasErrors([
            'login' => 'Akun Anda dinonaktifkan. Alasan: NISN tidak ditemukan di arsip kelulusan.',
        ]);
        $this->assertGuest();
    }

    public function test_inactive_user_without_reason_sees_generic_deactivation_message(): void
    {
        User::factory()->alumni()->inactive()->create(['nisn' => '0051230003']);

        $response = $this->post('/login', ['login' => '0051230003', 'password' => 'password']);

        $response->assertSessionHasErrors([
            'login' => 'Akun Anda dinonaktifkan. Silakan hubungi admin madrasah.',
        ]);
        $this->assertGuest();
    }

    public function test_pending_user_is_redirected_away_from_alumni_dashboard(): void
    {
        $user = User::factory()->alumni()->pending()->create();

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertRedirect(route('verification.pending'));
    }

    public function test_pending_admin_is_redirected_away_from_admin_dashboard(): void
    {
        $admin = User::factory()->admin()->pending()->create();

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertRedirect(route('verification.pending'));
    }

    public function test_inactive_session_is_logged_out_when_opening_dashboard(): void
    {
        $user = User::factory()->alumni()->inactive('Data ganda.')->create();

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertRedirect(route('login'));
        $response->assertSessionHasErrors(['login' => 'Akun Anda dinonaktifkan. Alasan: Data ganda.']);
        $this->assertGuest();
    }

    public function test_inactive_admin_session_is_logged_out_when_opening_admin_panel(): void
    {
        $admin = User::factory()->admin()->inactive()->create();

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertRedirect(route('login'));
        $this->assertGuest();
    }

    public function test_pending_page_renders_registrant_contact_details(): void
    {
        $user = User::factory()->alumni()->pending()->create(['name' => 'Ahmad Fauzi']);
        AlumniProfile::factory()->create(['user_id' => $user->id, 'phone_number' => '081298765432']);

        $response = $this->actingAs($user)->get(route('verification.pending'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Auth/PendingVerification')
            ->where('name', 'Ahmad Fauzi')
            ->where('phoneNumber', '081298765432')
        );
    }

    public function test_pending_page_redirects_active_user_to_dashboard(): void
    {
        $user = User::factory()->alumni()->create();

        $response = $this->actingAs($user)->get(route('verification.pending'));

        $response->assertRedirect(route('dashboard'));
    }

    public function test_pending_page_requires_authentication(): void
    {
        $response = $this->get(route('verification.pending'));

        $response->assertRedirect(route('login'));
    }
}
