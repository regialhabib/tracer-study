<?php

namespace Tests\Feature\Pesan;

use App\Models\AlumniProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class KontakTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    /**
     * @param  array<string, mixed>  $user
     * @param  array<string, mixed>  $profile
     */
    private function alumni(array $user = [], array $profile = []): User
    {
        $alumni = User::factory()->create($user);
        AlumniProfile::factory()->create(['user_id' => $alumni->id, ...$profile]);

        return $alumni;
    }

    /**
     * @return list<int>
     */
    private function contactIds(TestResponse $response): array
    {
        return collect($response->viewData('page')['props']['contacts']['data'])->pluck('id')->all();
    }

    public function test_search_page_does_not_expose_sensitive_fields(): void
    {
        $me = $this->alumni();
        $this->alumni(['name' => 'Rahasia Budi'], ['address' => 'Jl. Rahasia 1']);

        $response = $this->actingAs($me)->get(route('pesan.cari'))->assertOk();

        $content = json_encode($response->viewData('page')['props']['contacts']);
        $this->assertStringContainsString('Rahasia Budi', $content);
        foreach (['email', 'nisn', 'phone_number', 'address', 'birth_date'] as $field) {
            $this->assertStringNotContainsString('"'.$field.'"', $content);
        }
        $this->assertStringNotContainsString('Jl. Rahasia 1', $content);
    }

    public function test_pending_inactive_and_self_are_hidden(): void
    {
        $me = $this->alumni();
        $pending = $this->alumni(['status' => 'pending']);
        $inactive = User::factory()->inactive()->create();
        $visible = $this->alumni();

        $ids = $this->contactIds($this->actingAs($me)->get(route('pesan.cari')));

        $this->assertContains($visible->id, $ids);
        $this->assertNotContains($me->id, $ids);
        $this->assertNotContains($pending->id, $ids);
        $this->assertNotContains($inactive->id, $ids);
    }

    public function test_alumni_who_disallow_alumni_messages_are_hidden_from_alumni_but_visible_to_admin(): void
    {
        $me = $this->alumni();
        $private = $this->alumni([], ['allow_alumni_messages' => false]);
        $admin = User::factory()->admin()->create();

        $this->assertNotContains($private->id, $this->contactIds($this->actingAs($me)->get(route('pesan.cari'))));
        $this->assertContains($private->id, $this->contactIds($this->actingAs($admin)->get(route('pesan.cari'))));
    }

    public function test_alumni_sees_admin_and_users_who_blocked_them_are_hidden(): void
    {
        $me = $this->alumni();
        $admin = User::factory()->admin()->create();
        $blocker = $this->alumni();
        $blocker->blockedUsers()->attach($me->id);

        $ids = $this->contactIds($this->actingAs($me)->get(route('pesan.cari')));

        $this->assertContains($admin->id, $ids);
        $this->assertNotContains($blocker->id, $ids);
    }

    public function test_filters_by_name_angkatan_and_peminatan(): void
    {
        $me = $this->alumni();
        $admin = User::factory()->admin()->create(['name' => 'Admin Pondok']);
        $match = $this->alumni(['name' => 'Siti Aminah'], ['graduation_year' => 2020, 'major' => 'MIPA']);
        $other = $this->alumni(['name' => 'Ahmad Zaki'], ['graduation_year' => 2021, 'major' => 'IPS']);

        $byName = $this->contactIds($this->actingAs($me)->get(route('pesan.cari', ['q' => 'aminah'])));
        $this->assertSame([$match->id], $byName);

        $byFilter = $this->contactIds($this->actingAs($me)->get(route('pesan.cari', ['angkatan' => 2020, 'peminatan' => 'MIPA'])));
        $this->assertSame([$match->id], $byFilter);
        $this->assertNotContains($admin->id, $byFilter);
        $this->assertNotContains($other->id, $byFilter);
    }

    public function test_props_include_filters_options_and_pagination(): void
    {
        $me = $this->alumni();
        for ($i = 0; $i < 13; $i++) {
            $this->alumni([], ['graduation_year' => 2022]);
        }

        $this->actingAs($me)->get(route('pesan.cari'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Pesan/Cari')
                ->has('contacts.data', 12)
                ->where('filterOptions.angkatan', [2024, 2022])
                ->has('filterOptions.peminatan')
                ->where('filters.q', ''));
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get(route('pesan.cari'))->assertRedirect(route('login'));
    }
}
