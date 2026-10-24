<?php

namespace Tests\Feature\Admin\Verifikasi;

use App\Enums\AccountStatus;
use App\Models\AlumniProfile;
use App\Models\User;
use App\Notifications\AkunDiverifikasiNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class VerifikasiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    private function pendingWithProfile(array $attributes = []): User
    {
        $user = User::factory()->pending()->create($attributes);
        AlumniProfile::factory()->create(['user_id' => $user->id, 'phone_number' => '081234567890']);

        return $user;
    }

    public function test_antrean_hanya_berisi_alumni_pending(): void
    {
        $admin = User::factory()->admin()->create();
        $pending = $this->pendingWithProfile(['nisn' => '0012345678']);
        $other = $this->pendingWithProfile(['nisn' => '0099999999']);
        User::factory()->create();
        User::factory()->inactive()->create();

        $this->actingAs($admin)
            ->get(route('admin.verifikasi.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Verifikasi/Index')
                ->has('registrations.data', 2)
                ->where('registrations.data.0.id', $pending->id)
                ->where('registrations.data.1.id', $other->id)
                ->where('adminBadges.verifikasi', 2));
    }

    public function test_setujui_mengaktifkan_akun_menyimpan_notifikasi_dan_memberi_tautan_whatsapp(): void
    {
        $admin = User::factory()->admin()->create();
        $pending = $this->pendingWithProfile();

        $this->actingAs($admin)
            ->post(route('admin.verifikasi.approve', $pending))
            ->assertRedirect(route('admin.verifikasi.index'))
            ->assertSessionHas('whatsappUrl', fn ($url) => str_starts_with($url, 'https://wa.me/62'));

        $pending->refresh();
        $this->assertSame(AccountStatus::Active, $pending->status);
        $this->assertNotNull($pending->verified_at);
        $this->assertSame($admin->id, $pending->verified_by);

        $notification = $pending->notifications()->first();
        $this->assertSame(AkunDiverifikasiNotification::class, $notification->type);
        $this->assertSame(route('dashboard'), $notification->data['url']);
    }

    public function test_setujui_akun_yang_bukan_pending_ditolak(): void
    {
        $admin = User::factory()->admin()->create();
        $active = User::factory()->create();

        $this->actingAs($admin)
            ->post(route('admin.verifikasi.approve', $active))
            ->assertSessionHasErrors('status');

        $this->assertCount(0, $active->notifications);
    }

    public function test_tolak_mewajibkan_alasan_lalu_menonaktifkan_akun(): void
    {
        $admin = User::factory()->admin()->create();
        $pending = $this->pendingWithProfile();

        $this->actingAs($admin)
            ->post(route('admin.verifikasi.reject', $pending), ['rejection_reason' => ''])
            ->assertSessionHasErrors('rejection_reason');
        $this->assertTrue($pending->refresh()->isPending());

        $this->actingAs($admin)
            ->post(route('admin.verifikasi.reject', $pending), ['rejection_reason' => 'NISN tidak dikenal.'])
            ->assertRedirect(route('admin.verifikasi.index'));

        $pending->refresh();
        $this->assertSame(AccountStatus::Inactive, $pending->status);
        $this->assertSame('NISN tidak dikenal.', $pending->rejection_reason);
    }

    public function test_alumni_tidak_dapat_mengakses_antrean_verifikasi(): void
    {
        $alumni = User::factory()->create();
        $pending = $this->pendingWithProfile();

        $this->actingAs($alumni)->get(route('admin.verifikasi.index'))->assertForbidden();
        $this->actingAs($alumni)->post(route('admin.verifikasi.approve', $pending))->assertForbidden();
        $this->assertTrue($pending->refresh()->isPending());
    }
}
