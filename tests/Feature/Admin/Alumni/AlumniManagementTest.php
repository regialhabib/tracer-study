<?php

namespace Tests\Feature\Admin\Alumni;

use App\Enums\AccountStatus;
use App\Models\AlumniProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use OpenSpout\Reader\XLSX\Reader;
use Tests\TestCase;

class AlumniManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();

        $this->admin = User::factory()->admin()->create();
    }

    private function makeAlumni(array $user = [], array $profile = []): User
    {
        $alumni = User::factory()->alumni()->create($user);
        AlumniProfile::factory()->create(['user_id' => $alumni->id, ...$profile]);

        return $alumni;
    }

    /**
     * @return array<string, mixed>
     */
    private function validPayload(array $overrides = []): array
    {
        return [
            'name' => 'Ahmad Fauzi',
            'nisn' => '0012345678',
            'email' => null,
            'gender' => 'L',
            'birth_date' => '2005-08-17',
            'phone_number' => '081234567890',
            'entry_year' => 2021,
            'graduation_year' => 2024,
            'major' => 'MIPA',
            'current_status' => 'bekerja',
            ...$overrides,
        ];
    }

    public function test_index_only_lists_alumni_and_is_paginated_by_25(): void
    {
        User::factory()->count(26)->alumni()->create()->each(
            fn (User $user) => AlumniProfile::factory()->create(['user_id' => $user->id])
        );

        $this->actingAs($this->admin)->get(route('admin.alumni.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Alumni/Index')
                ->has('alumni.data', 25)
                ->where('alumni.total', 26));
    }

    public function test_index_filters_and_search_work_together(): void
    {
        $this->makeAlumni(['name' => 'Budi Santoso', 'nisn' => '0011111111'], ['graduation_year' => 2023, 'gender' => 'L', 'major' => 'IPS', 'current_status' => 'bekerja']);
        $this->makeAlumni(['name' => 'Siti Aminah', 'nisn' => '0022222222'], ['graduation_year' => 2024, 'gender' => 'P', 'major' => 'MIPA', 'current_status' => 'wirausaha']);
        $this->makeAlumni(['name' => 'Candra', 'nisn' => '0033333333'], ['graduation_year' => 2024, 'gender' => 'L', 'major' => 'MIPA', 'current_status' => 'bekerja']);
        User::factory()->alumni()->inactive('x')->create(['name' => 'Dina', 'nisn' => '0044444444']);

        $names = fn (array $query) => collect(
            $this->actingAs($this->admin)->get(route('admin.alumni.index', $query))
                ->viewData('page')['props']['alumni']['data']
        )->pluck('name')->all();

        $this->assertSame(['Budi Santoso'], $names(['q' => 'Budi']));
        $this->assertSame(['Siti Aminah'], $names(['q' => '0022222']));
        $this->assertSame(['Candra', 'Siti Aminah'], $names(['angkatan' => 2024]));
        $this->assertSame(['Siti Aminah'], $names(['gender' => 'P']));
        $this->assertSame(['Budi Santoso'], $names(['major' => 'IPS']));
        $this->assertSame(['Candra'], $names(['status_kegiatan' => 'bekerja', 'angkatan' => 2024]));
        $this->assertSame(['Dina'], $names(['status_akun' => 'inactive']));
    }

    public function test_index_excludes_admins_and_hides_deleted_unless_requested(): void
    {
        $alumni = $this->makeAlumni(['name' => 'Terhapus']);
        $alumni->delete();
        $this->makeAlumni(['name' => 'Aktif']);

        $this->actingAs($this->admin)->get(route('admin.alumni.index'))
            ->assertInertia(fn (Assert $page) => $page->where('alumni.total', 1)->where('alumni.data.0.name', 'Aktif'));

        $this->actingAs($this->admin)->get(route('admin.alumni.index', ['tampilkan_terhapus' => 1]))
            ->assertInertia(fn (Assert $page) => $page->where('alumni.total', 2));
    }

    public function test_show_displays_deleted_alumni_to_admin(): void
    {
        $alumni = $this->makeAlumni(['name' => 'Terhapus']);
        $this->actingAs($this->admin)->delete(route('admin.alumni.destroy', $alumni->id));

        $this->actingAs($this->admin)->get(route('admin.alumni.show', $alumni->id))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Alumni/Show')->where('alumni.name', 'Terhapus'));
    }

    public function test_show_returns_404_for_admin_accounts(): void
    {
        $this->actingAs($this->admin)->get(route('admin.alumni.show', $this->admin->id))->assertNotFound();
    }

    public function test_store_creates_active_alumni_with_birth_date_password_and_first_login(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.alumni.store'), $this->validPayload());

        $alumni = User::where('nisn', '0012345678')->firstOrFail();
        $response->assertRedirect(route('admin.alumni.show', $alumni->id))->assertSessionHas('passwordInfo');

        $this->assertSame('alumni', $alumni->role);
        $this->assertSame(AccountStatus::Active, $alumni->status);
        $this->assertTrue($alumni->first_login);
        $this->assertTrue(Hash::check('17082005', $alumni->password));
        $this->assertSame('MIPA', $alumni->profile->major);
    }

    public function test_store_falls_back_to_nisn_password_without_birth_date(): void
    {
        $this->actingAs($this->admin)->post(route('admin.alumni.store'), $this->validPayload(['birth_date' => null]));

        $this->assertTrue(Hash::check('0012345678', User::where('nisn', '0012345678')->firstOrFail()->password));
    }

    public function test_store_rejects_duplicate_nisn_including_soft_deleted(): void
    {
        $this->makeAlumni(['nisn' => '0012345678'])->delete();

        $this->actingAs($this->admin)->post(route('admin.alumni.store'), $this->validPayload())
            ->assertSessionHasErrors('nisn');

        $this->assertSame(1, User::withTrashed()->where('nisn', '0012345678')->count());
    }

    public function test_store_validates_required_fields(): void
    {
        $this->actingAs($this->admin)->post(route('admin.alumni.store'), ['nisn' => '123'])
            ->assertSessionHasErrors(['name', 'nisn', 'gender', 'entry_year', 'graduation_year', 'major', 'current_status']);
    }

    public function test_update_changes_account_and_profile_and_allows_keeping_own_nisn(): void
    {
        $alumni = $this->makeAlumni(['nisn' => '0012345678']);

        $this->actingAs($this->admin)->put(route('admin.alumni.update', $alumni->id), $this->validPayload(['name' => 'Nama Baru', 'major' => 'Bahasa']))
            ->assertRedirect(route('admin.alumni.show', $alumni->id));

        $this->assertSame('Nama Baru', $alumni->fresh()->name);
        $this->assertSame('Bahasa', $alumni->profile->fresh()->major);
    }

    public function test_deactivating_requires_reason_and_blocks_login(): void
    {
        $alumni = $this->makeAlumni(['nisn' => '0055555555']);

        $this->actingAs($this->admin)->patch(route('admin.alumni.status', $alumni->id), ['action' => 'deactivate'])
            ->assertSessionHasErrors('reason');

        $this->actingAs($this->admin)->patch(route('admin.alumni.status', $alumni->id), ['action' => 'deactivate', 'reason' => 'Data ganda.'])
            ->assertSessionHasNoErrors();

        $this->assertSame(AccountStatus::Inactive, $alumni->fresh()->status);

        $this->post('/logout');
        $this->post('/login', ['login' => '0055555555', 'password' => 'password']);
        $this->get(route('dashboard'))->assertRedirect();
        $this->assertGuest();
    }

    public function test_activate_restores_active_status(): void
    {
        $alumni = User::factory()->alumni()->inactive('Alasan')->create();

        $this->actingAs($this->admin)->patch(route('admin.alumni.status', $alumni->id), ['action' => 'activate']);

        $this->assertSame(AccountStatus::Active, $alumni->fresh()->status);
        $this->assertNull($alumni->fresh()->rejection_reason);
    }

    public function test_destroy_soft_deletes_and_restore_brings_back_account_and_profile(): void
    {
        $alumni = $this->makeAlumni();

        $this->actingAs($this->admin)->delete(route('admin.alumni.destroy', $alumni->id))
            ->assertRedirect(route('admin.alumni.index'));

        $this->assertSoftDeleted('users', ['id' => $alumni->id]);
        $this->assertSoftDeleted('alumni_profiles', ['user_id' => $alumni->id]);

        $this->actingAs($this->admin)->patch(route('admin.alumni.restore', $alumni->id));

        $this->assertNotSoftDeleted('users', ['id' => $alumni->id]);
        $this->assertNotSoftDeleted('alumni_profiles', ['user_id' => $alumni->id]);
    }

    public function test_reset_password_sets_birth_date_password_first_login_and_whatsapp_url(): void
    {
        $alumni = $this->makeAlumni(
            ['first_login' => false],
            ['birth_date' => '2004-03-09', 'phone_number' => '081234567890']
        );

        $this->actingAs($this->admin)->post(route('admin.alumni.reset-password', $alumni->id))
            ->assertSessionHas('passwordInfo')
            ->assertSessionHas('resetWhatsappUrl', fn ($url) => str_starts_with($url, 'https://wa.me/6281234567890?text='));

        $alumni->refresh();
        $this->assertTrue(Hash::check('09032004', $alumni->password));
        $this->assertTrue($alumni->first_login);
    }

    public function test_export_returns_xlsx_following_active_filters(): void
    {
        $this->makeAlumni(['name' => 'Budi', 'nisn' => '0011111111'], ['graduation_year' => 2023]);
        $this->makeAlumni(['name' => 'Siti', 'nisn' => '0022222222'], ['graduation_year' => 2024]);
        $this->makeAlumni(['name' => 'Candra', 'nisn' => '0033333333'], ['graduation_year' => 2024]);

        $response = $this->actingAs($this->admin)->get(route('admin.alumni.export', ['angkatan' => 2024]));

        $response->assertOk();
        $this->assertStringContainsString('alumni-'.now()->format('Ymd').'.xlsx', $response->headers->get('content-disposition'));

        $path = tempnam(sys_get_temp_dir(), 'alumni').'.xlsx';
        file_put_contents($path, $response->streamedContent());

        $reader = new Reader;
        $reader->open($path);
        $rows = [];
        foreach ($reader->getSheetIterator() as $sheet) {
            foreach ($sheet->getRowIterator() as $row) {
                $rows[] = $row->toArray();
            }
        }
        $reader->close();
        unlink($path);

        $this->assertCount(3, $rows);
        $this->assertSame('NISN', $rows[0][0]);
        $this->assertSame(['Candra', 'Siti'], [$rows[1][1], $rows[2][1]]);
    }

    public function test_alumni_cannot_access_admin_alumni_routes(): void
    {
        $alumni = $this->makeAlumni();
        $this->actingAs($alumni);

        $this->get(route('admin.alumni.index'))->assertForbidden();
        $this->get(route('admin.alumni.export'))->assertForbidden();
        $this->post(route('admin.alumni.store'), $this->validPayload())->assertForbidden();
        $this->delete(route('admin.alumni.destroy', $alumni->id))->assertForbidden();
        $this->post(route('admin.alumni.reset-password', $alumni->id))->assertForbidden();
    }
}
