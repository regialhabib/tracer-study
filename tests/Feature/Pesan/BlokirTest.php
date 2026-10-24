<?php

namespace Tests\Feature\Pesan;

use App\Models\AlumniProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BlokirTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    /**
     * @param  array<string, mixed>  $profile
     */
    private function alumni(array $profile = []): User
    {
        $alumni = User::factory()->create();
        AlumniProfile::factory()->create(['user_id' => $alumni->id, ...$profile]);

        return $alumni;
    }

    public function test_alumni_can_block_and_unblock_another_user(): void
    {
        $me = $this->alumni();
        $target = $this->alumni();

        $this->actingAs($me)->from('/dashboard')->post(route('pesan.blokir.store', $target))
            ->assertRedirect('/dashboard')->assertSessionHas('status');
        $this->assertTrue($me->fresh()->hasBlocked($target));

        $this->actingAs($me)->post(route('pesan.blokir.store', $target))->assertRedirect();
        $this->assertSame(1, $me->blockedUsers()->count());

        $this->actingAs($me)->delete(route('pesan.blokir.destroy', $target))->assertRedirect();
        $this->assertFalse($me->fresh()->hasBlocked($target));
    }

    public function test_alumni_cannot_block_admin_or_self(): void
    {
        $me = $this->alumni();
        $admin = User::factory()->admin()->create();

        $this->actingAs($me)->post(route('pesan.blokir.store', $admin))->assertForbidden();
        $this->actingAs($me)->post(route('pesan.blokir.store', $me))->assertForbidden();
        $this->assertSame(0, $me->blockedUsers()->count());
    }

    public function test_admin_can_block_alumni(): void
    {
        $admin = User::factory()->admin()->create();
        $target = $this->alumni();

        $this->actingAs($admin)->post(route('pesan.blokir.store', $target))->assertRedirect();
        $this->assertTrue($admin->fresh()->hasBlocked($target));
    }

    public function test_alumni_can_toggle_privacy_setting(): void
    {
        $me = $this->alumni();

        $this->actingAs($me)->patch(route('profile.pesan.update'), ['allow_alumni_messages' => false])
            ->assertRedirect(route('profile.edit'));
        $this->assertFalse($me->profile->fresh()->allow_alumni_messages);

        $this->actingAs($me)->patch(route('profile.pesan.update'), ['allow_alumni_messages' => true]);
        $this->assertTrue($me->profile->fresh()->allow_alumni_messages);
    }

    public function test_privacy_setting_requires_boolean(): void
    {
        $me = $this->alumni();

        $this->actingAs($me)->patch(route('profile.pesan.update'), ['allow_alumni_messages' => 'abc'])
            ->assertSessionHasErrors('allow_alumni_messages');
    }

    public function test_admin_cannot_use_privacy_setting(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->patch(route('profile.pesan.update'), ['allow_alumni_messages' => false])
            ->assertForbidden();
    }

    public function test_profile_edit_shares_pesan_settings_and_blocked_users(): void
    {
        $me = $this->alumni(['allow_alumni_messages' => false]);
        $blocked = $this->alumni();
        $me->blockedUsers()->attach($blocked->id);

        $this->actingAs($me)->get(route('profile.edit'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('pesanSettings.allow_alumni_messages', false)
                ->has('blockedUsers', 1)
                ->where('blockedUsers.0.id', $blocked->id)
                ->missing('blockedUsers.0.email'));

        $admin = User::factory()->admin()->create();
        $this->actingAs($admin)->get(route('profile.edit'))
            ->assertInertia(fn (Assert $page) => $page->where('pesanSettings', null)->has('blockedUsers', 0));
    }
}
