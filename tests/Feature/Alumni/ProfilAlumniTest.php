<?php

namespace Tests\Feature\Alumni;

use App\Models\AlumniProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProfilAlumniTest extends TestCase
{
    use RefreshDatabase;

    private function alumniWithProfile(array $profile = []): User
    {
        $user = User::factory()->alumni()->create(['nisn' => '1234567890']);
        AlumniProfile::factory()->for($user)->create($profile + [
            'major' => 'MIPA',
            'graduation_year' => 2024,
            'entry_year' => 2021,
            'gender' => 'L',
            'current_status' => 'bekerja',
        ]);

        return $user;
    }

    public function test_alumni_sees_official_and_editable_data(): void
    {
        $user = $this->alumniWithProfile();

        $this->actingAs($user)->get('/profile')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Profile/Edit')
                ->where('alumni.nisn', '1234567890')
                ->where('alumni.major', 'MIPA')
                ->where('alumni.current_status', 'bekerja'));
    }

    public function test_contact_domicile_and_status_are_saved(): void
    {
        $user = $this->alumniWithProfile();

        $this->actingAs($user)->patch('/profile', [
            'email' => 'baru@example.com',
            'phone_number' => '081234567890',
            'city' => 'Sumenep',
            'province' => 'Jawa Timur',
            'address' => 'Jl. Contoh No. 1',
            'current_status' => 'wirausaha',
        ])->assertSessionHasNoErrors()->assertRedirect('/profile');

        $profile = $user->profile->fresh();
        $this->assertSame('wirausaha', $profile->current_status);
        $this->assertSame('Sumenep', $profile->city);
        $this->assertSame('081234567890', $profile->phone_number);
        $this->assertSame('baru@example.com', $user->fresh()->email);
    }

    public function test_official_fields_cannot_be_changed(): void
    {
        $user = $this->alumniWithProfile();

        $this->actingAs($user)->patch('/profile', [
            'email' => 'baru@example.com',
            'phone_number' => '081234567890',
            'current_status' => 'bekerja',
            'nisn' => '9999999999',
            'name' => 'Nama Palsu',
            'graduation_year' => 2000,
            'entry_year' => 1999,
            'major' => 'IPS',
            'gender' => 'P',
        ])->assertSessionHasNoErrors();

        $user->refresh();
        $profile = $user->profile->fresh();
        $this->assertSame('1234567890', $user->nisn);
        $this->assertNotSame('Nama Palsu', $user->name);
        $this->assertSame(2024, $profile->graduation_year);
        $this->assertSame(2021, $profile->entry_year);
        $this->assertSame('MIPA', $profile->major);
        $this->assertSame('L', $profile->gender);
    }

    public function test_whatsapp_number_and_status_are_validated_and_email_is_unique(): void
    {
        $user = $this->alumniWithProfile();
        $other = User::factory()->alumni()->create(['email' => 'dipakai@example.com']);

        $this->actingAs($user)->from('/profile')->patch('/profile', [
            'email' => $other->email,
            'phone_number' => 'abc',
            'current_status' => 'tidak-ada',
        ])->assertSessionHasErrors(['email', 'phone_number', 'current_status']);
    }

    public function test_avatar_can_be_uploaded_and_replaced_and_old_file_removed(): void
    {
        Storage::fake('public');
        $user = $this->alumniWithProfile();

        $this->actingAs($user)->post('/profile/avatar', [
            'avatar' => UploadedFile::fake()->image('a.jpg'),
        ])->assertSessionHasNoErrors();

        $first = $user->fresh()->avatar_path;
        Storage::disk('public')->assertExists($first);
        $this->assertStringStartsWith('avatars/', $first);

        $this->actingAs($user)->post('/profile/avatar', [
            'avatar' => UploadedFile::fake()->image('b.png'),
        ])->assertSessionHasNoErrors();

        $second = $user->fresh()->avatar_path;
        Storage::disk('public')->assertMissing($first);
        Storage::disk('public')->assertExists($second);

        $this->actingAs($user)->delete('/profile/avatar')->assertRedirect('/profile');

        Storage::disk('public')->assertMissing($second);
        $this->assertNull($user->fresh()->avatar_path);
    }

    public function test_invalid_avatar_is_rejected(): void
    {
        Storage::fake('public');
        $user = $this->alumniWithProfile();

        $this->actingAs($user)->post('/profile/avatar', [
            'avatar' => UploadedFile::fake()->create('a.pdf', 100, 'application/pdf'),
        ])->assertSessionHasErrors('avatar');

        $this->actingAs($user)->post('/profile/avatar', [
            'avatar' => UploadedFile::fake()->image('big.jpg')->size(3000),
        ])->assertSessionHasErrors('avatar');
    }

    public function test_admin_sees_no_alumni_data_and_cannot_change_it(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->get('/profile')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('alumni', null));

        $this->actingAs($admin)->patch('/profile', [
            'name' => 'Admin Baru',
            'email' => 'admin.baru@example.com',
            'phone_number' => '081234567890',
            'current_status' => 'bekerja',
        ])->assertSessionHasNoErrors();

        $this->assertSame('Admin Baru', $admin->fresh()->name);
        $this->assertNull($admin->profile);
    }

    public function test_admin_can_upload_avatar_without_alumni_profile(): void
    {
        Storage::fake('public');
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post('/profile/avatar', [
            'avatar' => UploadedFile::fake()->image('a.jpg'),
        ])->assertRedirect('/profile');

        $path = $admin->fresh()->avatar_path;
        Storage::disk('public')->assertExists($path);
        $this->assertNull($admin->fresh()->profile);

        $this->actingAs($admin)->get('/profile')
            ->assertInertia(fn (Assert $page) => $page->where('auth.user.avatar_src', Storage::disk('public')->url($path)));
    }
}
