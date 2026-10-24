<?php

namespace Tests\Feature\Auth;

use App\Models\AlumniProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class FirstLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_alumni_onboarding_page_includes_consent_text(): void
    {
        $user = User::factory()->alumni()->firstLogin()->create();
        AlumniProfile::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->get(route('first-login.prompt'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Auth/FirstLogin')
            ->where('isAdmin', false)
            ->where('consent.summary', config('tracer.consent_text.summary'))
        );
    }

    public function test_alumni_onboarding_rejects_missing_whatsapp_number_and_consent(): void
    {
        $user = User::factory()->alumni()->firstLogin()->create();
        AlumniProfile::factory()->create(['user_id' => $user->id, 'phone_number' => null]);

        $response = $this->actingAs($user)->post(route('first-login.update'), [
            'email' => 'alumni@contoh.test',
            'password' => 'PasswordBaru123!',
            'password_confirmation' => 'PasswordBaru123!',
        ]);

        $response->assertSessionHasErrors([
            'phone_number' => 'Kolom nomor WhatsApp wajib diisi.',
            'data_consent' => 'Anda perlu menyetujui penggunaan data untuk melanjutkan.',
        ]);
        $this->assertTrue($user->fresh()->first_login);
        $this->assertNull($user->fresh()->data_consent_at);
    }

    public function test_alumni_onboarding_stores_whatsapp_number_and_consent_time(): void
    {
        $this->freezeSecond();
        $user = User::factory()->alumni()->firstLogin()->create();
        $profile = AlumniProfile::factory()->create(['user_id' => $user->id, 'phone_number' => null]);

        $response = $this->actingAs($user)->post(route('first-login.update'), [
            'email' => 'alumni@contoh.test',
            'phone_number' => '+62 812-3456-7890',
            'data_consent' => '1',
            'password' => 'PasswordBaru123!',
            'password_confirmation' => 'PasswordBaru123!',
        ]);

        $response->assertRedirect(route('dashboard'));
        $user->refresh();
        $this->assertFalse($user->first_login);
        $this->assertSame('alumni@contoh.test', $user->email);
        $this->assertSame(now()->toDateTimeString(), $user->data_consent_at?->toDateTimeString());
        $this->assertSame('+62 812-3456-7890', $profile->fresh()->phone_number);
    }

    public function test_admin_onboarding_only_requires_new_password_and_keeps_email(): void
    {
        $admin = User::factory()->admin()->firstLogin()->create(['email' => 'admin@madrasah.test']);

        $response = $this->actingAs($admin)->post(route('first-login.update'), [
            'password' => 'PasswordAdmin123!',
            'password_confirmation' => 'PasswordAdmin123!',
        ]);

        $response->assertRedirect(route('admin.dashboard'));
        $admin->refresh();
        $this->assertFalse($admin->first_login);
        $this->assertSame('admin@madrasah.test', $admin->email);
        $this->assertNull($admin->data_consent_at);
        $this->assertTrue(Hash::check('PasswordAdmin123!', $admin->password));
    }

    public function test_admin_with_first_login_is_redirected_to_onboarding_from_admin_panel(): void
    {
        $admin = User::factory()->admin()->firstLogin()->create();

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertRedirect(route('first-login.prompt'));
    }

    public function test_onboarding_submission_is_forbidden_after_onboarding_is_complete(): void
    {
        $user = User::factory()->alumni()->create(['email' => 'lama@contoh.test']);

        $response = $this->actingAs($user)->post(route('first-login.update'), [
            'email' => 'baru@contoh.test',
            'password' => 'PasswordBaru123!',
            'password_confirmation' => 'PasswordBaru123!',
        ]);

        $response->assertForbidden();
        $this->assertSame('lama@contoh.test', $user->fresh()->email);
    }
}
