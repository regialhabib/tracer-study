<?php

namespace Tests\Feature\Auth;

use App\Enums\AccountStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_renders_with_consent_text(): void
    {
        $response = $this->get('/register');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Auth/Register')
            ->where('consent.label', config('tracer.consent_text.label'))
            ->has('consent.points', count(config('tracer.consent_text.points')))
        );
    }

    public function test_self_registration_creates_pending_account_and_redirects_to_pending_page(): void
    {
        $this->freezeSecond();

        $response = $this->post('/register', $this->validPayload());

        $response->assertRedirect(route('verification.pending'));
        $this->assertAuthenticated();

        $user = User::where('email', 'test@example.com')->firstOrFail();
        $this->assertSame(AccountStatus::Pending, $user->status);
        $this->assertFalse($user->first_login);
        $this->assertSame(now()->toDateTimeString(), $user->data_consent_at?->toDateTimeString());
        $this->assertSame('081234567890', $user->profile->phone_number);
    }

    public function test_registration_rejects_missing_whatsapp_number_and_consent(): void
    {
        $payload = $this->validPayload();
        unset($payload['phone_number'], $payload['data_consent']);

        $response = $this->from('/register')->post('/register', $payload);

        $response->assertRedirect('/register');
        $response->assertSessionHasErrors([
            'phone_number' => 'Kolom nomor WhatsApp wajib diisi.',
            'data_consent' => 'Anda perlu menyetujui penggunaan data untuk melanjutkan.',
        ]);
        $this->assertGuest();
        $this->assertDatabaseMissing('users', ['email' => 'test@example.com']);
    }

    public function test_registration_rejects_malformed_whatsapp_number(): void
    {
        $response = $this->post('/register', [...$this->validPayload(), 'phone_number' => 'nomor-saya']);

        $response->assertSessionHasErrors([
            'phone_number' => 'Nomor WhatsApp tidak valid. Gunakan format seperti 081234567890.',
        ]);
        $this->assertDatabaseMissing('users', ['email' => 'test@example.com']);
    }

    public function test_registration_with_imported_nisn_points_alumni_to_login(): void
    {
        User::factory()->alumni()->firstLogin()->create(['nisn' => '0051234567']);

        $response = $this->post('/register', [...$this->validPayload(), 'nisn' => '0051234567']);

        $response->assertSessionHasErrors('nisn');
        $this->assertStringContainsString('Silakan masuk dengan NISN', session('errors')->first('nisn'));
        $this->assertDatabaseMissing('users', ['email' => 'test@example.com']);
    }

    /**
     * @return array<string, mixed>
     */
    private function validPayload(): array
    {
        return [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone_number' => '081234567890',
            'data_consent' => true,
            'password' => 'password',
            'password_confirmation' => 'password',
        ];
    }
}
