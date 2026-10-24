<?php

namespace Tests\Feature\Admin\Pengguna;

use App\Enums\AccountStatus;
use App\Models\User;
use App\Services\Admin\AdminUserService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminUserTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_index_hanya_menampilkan_akun_admin(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->admin()->create();
        User::factory()->count(3)->create();

        $this->actingAs($admin)
            ->get(route('admin.pengguna.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Pengguna/Index')
                ->has('admins.data', 2));
    }

    public function test_admin_baru_aktif_dan_wajib_onboarding_saat_login_pertama(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post(route('admin.pengguna.store'), [
                'name' => 'Ustadz Baru',
                'email' => 'baru@example.com',
                'password' => 'sandi-awal-123',
            ])
            ->assertRedirect(route('admin.pengguna.index'));

        $newAdmin = User::where('email', 'baru@example.com')->firstOrFail();
        $this->assertSame('admin', $newAdmin->role);
        $this->assertSame(AccountStatus::Active, $newAdmin->status);
        $this->assertTrue($newAdmin->first_login);

        auth()->logout();

        $this->actingAs($newAdmin)
            ->get(route('admin.dashboard'))
            ->assertRedirect();
    }

    public function test_pembuatan_admin_memvalidasi_email_unik_dan_kata_sandi(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post(route('admin.pengguna.store'), [
                'name' => 'X',
                'email' => $admin->email,
                'password' => 'pendek',
            ])
            ->assertSessionHasErrors(['email', 'password']);
    }

    public function test_edit_memperbarui_nama_dan_email(): void
    {
        $admin = User::factory()->admin()->create();
        $other = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->put(route('admin.pengguna.update', $other), ['name' => 'Nama Baru', 'email' => 'baru@example.com'])
            ->assertRedirect(route('admin.pengguna.index'));

        $this->assertSame('Nama Baru', $other->refresh()->name);

        $this->actingAs($admin)
            ->put(route('admin.pengguna.update', $other), ['name' => 'Nama Baru', 'email' => $admin->email])
            ->assertSessionHasErrors('email');
    }

    public function test_akun_alumni_tidak_dapat_diedit_lewat_kelola_admin(): void
    {
        $admin = User::factory()->admin()->create();
        $alumni = User::factory()->create();

        $this->actingAs($admin)->get(route('admin.pengguna.edit', $alumni))->assertNotFound();
    }

    public function test_admin_dapat_menonaktifkan_dan_mengaktifkan_kembali_admin_lain(): void
    {
        $admin = User::factory()->admin()->create();
        $other = User::factory()->admin()->create();

        $this->actingAs($admin)->patch(route('admin.pengguna.deactivate', $other))->assertRedirect();
        $this->assertTrue($other->refresh()->isInactive());

        $this->actingAs($admin)->patch(route('admin.pengguna.activate', $other))->assertRedirect();
        $this->assertTrue($other->refresh()->isActive());
    }

    public function test_tidak_boleh_menonaktifkan_diri_sendiri(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->admin()->create();

        $this->actingAs($admin)
            ->patch(route('admin.pengguna.deactivate', $admin))
            ->assertSessionHasErrors('status');

        $this->assertTrue($admin->refresh()->isActive());
    }

    public function test_tidak_boleh_menonaktifkan_admin_aktif_terakhir(): void
    {
        $lastActive = User::factory()->admin()->create();
        $actor = User::factory()->admin()->inactive()->create();

        try {
            app(AdminUserService::class)->deactivate($lastActive, $actor);
            $this->fail('Penjaga admin aktif terakhir tidak bekerja.');
        } catch (ValidationException $exception) {
            $this->assertArrayHasKey('status', $exception->errors());
        }

        $this->assertTrue($lastActive->refresh()->isActive());
    }

    public function test_alumni_tidak_dapat_mengakses_kelola_admin(): void
    {
        $alumni = User::factory()->create();
        $admin = User::factory()->admin()->create();

        $this->actingAs($alumni)->get(route('admin.pengguna.index'))->assertForbidden();
        $this->actingAs($alumni)->post(route('admin.pengguna.store'), [])->assertForbidden();
        $this->actingAs($alumni)->patch(route('admin.pengguna.deactivate', $admin))->assertForbidden();
    }
}
