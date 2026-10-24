<?php

namespace Tests\Feature\Auth;

use App\Models\AlumniProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HybridAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_alumni_can_authenticate_using_nisn_and_password(): void
    {
        $user = User::factory()->alumni()->create([
            'nisn' => '0051112222',
            'password' => bcrypt('secret123'),
            'first_login' => false,
        ]);

        AlumniProfile::factory()->create(['user_id' => $user->id]);

        $response = $this->post('/login', [
            'login' => '0051112222',
            'password' => 'secret123',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect('/dashboard');
    }

    public function test_admin_can_authenticate_using_email_and_password(): void
    {
        $admin = User::factory()->admin()->create([
            'email' => 'ustadz.admin@pesantren.test',
            'password' => bcrypt('adminpass'),
        ]);

        $response = $this->post('/login', [
            'login' => 'ustadz.admin@pesantren.test',
            'password' => 'adminpass',
        ]);

        $this->assertAuthenticatedAs($admin);
        $response->assertRedirect('/admin/dashboard');
    }

    public function test_alumni_with_first_login_flag_is_redirected_to_first_login_prompt(): void
    {
        $user = User::factory()->alumni()->create([
            'nisn' => '0059990001',
            'password' => bcrypt('defaultpass'),
            'first_login' => true,
        ]);

        AlumniProfile::factory()->create(['user_id' => $user->id]);

        $response = $this->post('/login', [
            'login' => '0059990001',
            'password' => 'defaultpass',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('first-login.prompt'));

        // Mengakses rute dashboard ketika first_login masih true harus di-redirect ke first-login.prompt
        $dashboardResponse = $this->actingAs($user)->get('/dashboard');
        $dashboardResponse->assertRedirect(route('first-login.prompt'));
    }

    public function test_alumni_can_complete_first_login_onboarding(): void
    {
        $user = User::factory()->alumni()->create([
            'nisn' => '0059990002',
            'email' => null,
            'password' => bcrypt('oldpass'),
            'first_login' => true,
        ]);

        $profile = AlumniProfile::factory()->create([
            'user_id' => $user->id,
            'phone_number' => null,
        ]);

        $response = $this->actingAs($user)->post('/first-login', [
            'email' => 'santri.baru@alumni.test',
            'phone_number' => '081234567899',
            'data_consent' => true,
            'password' => 'PasswordBaru123!',
            'password_confirmation' => 'PasswordBaru123!',
        ]);

        $response->assertRedirect(route('dashboard'));

        $user->refresh();
        $profile->refresh();

        $this->assertFalse($user->first_login);
        $this->assertEquals('santri.baru@alumni.test', $user->email);
        $this->assertEquals('081234567899', $profile->phone_number);
    }

    public function test_non_admin_cannot_access_admin_dashboard(): void
    {
        $alumni = User::factory()->alumni()->create(['first_login' => false]);
        AlumniProfile::factory()->create(['user_id' => $alumni->id]);

        $response = $this->actingAs($alumni)->get('/admin/dashboard');

        $response->assertStatus(403);
    }

    public function test_alumni_can_register_themselves_with_nisn_and_profile(): void
    {
        $response = $this->post('/register', [
            'name' => 'Santri Pendaftar Mandiri',
            'nisn' => '0058887777',
            'email' => 'mandiri@alumni.test',
            'gender' => 'L',
            'major' => 'Keagamaan (PK)',
            'graduation_year' => 2024,
            'phone_number' => '089988776655',
            'data_consent' => true,
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertRedirect(route('verification.pending'));

        $this->assertDatabaseHas('users', [
            'nisn' => '0058887777',
            'email' => 'mandiri@alumni.test',
            'role' => 'alumni',
            'status' => 'pending',
            'first_login' => false,
        ]);

        $this->assertDatabaseHas('alumni_profiles', [
            'gender' => 'L',
            'major' => 'Keagamaan (PK)',
            'graduation_year' => 2024,
        ]);
    }
}
