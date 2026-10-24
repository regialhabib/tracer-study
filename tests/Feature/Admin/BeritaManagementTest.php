<?php

namespace Tests\Feature\Admin;

use App\Enums\BeritaStatus;
use App\Models\Berita;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BeritaManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();

        $this->admin = User::factory()->admin()->create();
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return array_merge([
            'type' => 'berita',
            'title' => 'Reuni Akbar Alumni',
            'content' => '<p>Isi berita yang <strong>penting</strong>.</p>',
            'status' => 'published',
        ], $overrides);
    }

    public function test_admin_can_list_berita_with_filters(): void
    {
        Berita::factory()->create(['title' => 'Beasiswa Kampus', 'type' => 'info_beasiswa']);
        Berita::factory()->create(['title' => 'Kabar Lain', 'type' => 'berita']);
        Berita::factory()->draft()->create(['title' => 'Draf Rahasia', 'type' => 'berita']);

        $this->actingAs($this->admin)
            ->get(route('admin.berita.index', ['tipe' => 'info_beasiswa']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Berita/Index')
                ->has('berita.data', 1)
                ->where('berita.data.0.title', 'Beasiswa Kampus'));

        $this->actingAs($this->admin)
            ->get(route('admin.berita.index', ['status' => 'draf']))
            ->assertInertia(fn (Assert $page) => $page
                ->has('berita.data', 1)
                ->where('berita.data.0.state', 'draft'));

        $this->actingAs($this->admin)
            ->get(route('admin.berita.index', ['q' => 'Kabar']))
            ->assertInertia(fn (Assert $page) => $page->has('berita.data', 1));
    }

    public function test_status_filter_separates_scheduled_from_published(): void
    {
        Berita::factory()->create(['title' => 'Sudah Terbit']);
        Berita::factory()->scheduled()->create(['title' => 'Nanti Terbit']);

        $this->actingAs($this->admin)
            ->get(route('admin.berita.index', ['status' => 'terjadwal']))
            ->assertInertia(fn (Assert $page) => $page
                ->has('berita.data', 1)
                ->where('berita.data.0.title', 'Nanti Terbit'));

        $this->actingAs($this->admin)
            ->get(route('admin.berita.index', ['status' => 'terbit']))
            ->assertInertia(fn (Assert $page) => $page
                ->has('berita.data', 1)
                ->where('berita.data.0.title', 'Sudah Terbit'));
    }

    public function test_admin_can_create_berita(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.berita.store'), $this->payload())
            ->assertRedirect(route('admin.berita.index'));

        $berita = Berita::firstOrFail();
        $this->assertSame('reuni-akbar-alumni', $berita->slug);
        $this->assertSame($this->admin->id, $berita->author_id);
        $this->assertSame(BeritaStatus::Published, $berita->status);
        $this->assertNotNull($berita->published_at);
        $this->assertTrue($berita->isPublished());
    }

    public function test_draft_has_no_published_at(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.berita.store'), $this->payload(['status' => 'draft', 'published_at' => now()->addDay()->toDateTimeString()]));

        $this->assertNull(Berita::firstOrFail()->published_at);
    }

    public function test_content_is_sanitized(): void
    {
        $html = '<p onclick="x()">Halo</p><script>alert(1)</script><img src="x" onerror="alert(1)">'
            .'<a href="javascript:alert(1)">jahat</a><a href="https://contoh.id" target="_blank">baik</a>'
            .'<h1>Judul</h1><h2>Sub</h2>';

        $this->actingAs($this->admin)
            ->post(route('admin.berita.store'), $this->payload(['content' => $html]))
            ->assertSessionHasNoErrors();

        $content = Berita::firstOrFail()->content;

        $this->assertStringNotContainsString('<script', $content);
        $this->assertStringNotContainsString('alert(1)</', $content);
        $this->assertStringNotContainsString('onerror', $content);
        $this->assertStringNotContainsString('onclick', $content);
        $this->assertStringNotContainsString('javascript:', $content);
        $this->assertStringNotContainsString('<img', $content);
        $this->assertStringNotContainsString('<h1', $content);
        $this->assertStringContainsString('<h2>Sub</h2>', $content);
        $this->assertStringContainsString('href="https://contoh.id"', $content);
    }

    public function test_slug_is_unique_and_stable_after_publish(): void
    {
        $this->actingAs($this->admin)->post(route('admin.berita.store'), $this->payload());
        $this->actingAs($this->admin)->post(route('admin.berita.store'), $this->payload());

        $this->assertSame(['reuni-akbar-alumni', 'reuni-akbar-alumni-2'], Berita::orderBy('id')->pluck('slug')->all());

        $berita = Berita::orderBy('id')->first();

        $this->actingAs($this->admin)
            ->put(route('admin.berita.update', $berita), $this->payload(['title' => 'Judul Baru Sekali']))
            ->assertRedirect(route('admin.berita.index'));

        $berita->refresh();
        $this->assertSame('Judul Baru Sekali', $berita->title);
        $this->assertSame('reuni-akbar-alumni', $berita->slug);
    }

    public function test_agenda_requires_event_fields(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.berita.store'), $this->payload(['type' => 'agenda']))
            ->assertSessionHasErrors(['event_date', 'location', 'registration_link']);

        $this->actingAs($this->admin)
            ->post(route('admin.berita.store'), $this->payload([
                'type' => 'agenda',
                'event_date' => now()->addWeek()->toDateTimeString(),
                'location' => 'Aula Utama',
                'registration_link' => 'https://daftar.contoh.id',
            ]))
            ->assertSessionHasNoErrors();

        $this->assertSame('Aula Utama', Berita::firstOrFail()->location);
    }

    public function test_event_fields_are_cleared_for_non_agenda_types(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.berita.store'), $this->payload([
                'type' => 'pengumuman',
                'event_date' => now()->addWeek()->toDateTimeString(),
                'location' => 'Aula Utama',
                'registration_link' => 'https://daftar.contoh.id',
            ]));

        $berita = Berita::firstOrFail();
        $this->assertNull($berita->event_date);
        $this->assertNull($berita->location);
        $this->assertNull($berita->registration_link);
    }

    public function test_content_must_have_visible_text(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.berita.store'), $this->payload(['content' => '<p></p><p>&nbsp;</p>']))
            ->assertSessionHasErrors('content');

        $this->assertDatabaseCount('berita', 0);
    }

    public function test_cover_is_converted_to_webp_and_replaced_and_removed(): void
    {
        Storage::fake('public');

        $this->actingAs($this->admin)
            ->post(route('admin.berita.store'), $this->payload(['thumbnail' => UploadedFile::fake()->image('sampul.png', 2400, 1200)]))
            ->assertSessionHasNoErrors();

        $berita = Berita::firstOrFail();
        $this->assertMatchesRegularExpression('#^berita/[0-9a-f-]+\.webp$#', $berita->thumbnail);
        Storage::disk('public')->assertExists($berita->thumbnail);
        $size = getimagesizefromstring(Storage::disk('public')->get($berita->thumbnail));
        $this->assertSame('image/webp', $size['mime']);
        $this->assertSame(1600, $size[0]);

        $oldPath = $berita->thumbnail;

        $this->actingAs($this->admin)
            ->put(route('admin.berita.update', $berita), $this->payload(['thumbnail' => UploadedFile::fake()->image('baru.jpg', 800, 600)]));

        $berita->refresh();
        Storage::disk('public')->assertMissing($oldPath);
        Storage::disk('public')->assertExists($berita->thumbnail);

        $current = $berita->thumbnail;

        $this->actingAs($this->admin)
            ->put(route('admin.berita.update', $berita), $this->payload(['remove_thumbnail' => true]));

        $this->assertNull($berita->refresh()->thumbnail);
        Storage::disk('public')->assertMissing($current);
    }

    public function test_cover_rejects_wrong_type_and_large_files(): void
    {
        Storage::fake('public');

        $this->actingAs($this->admin)
            ->post(route('admin.berita.store'), $this->payload(['thumbnail' => UploadedFile::fake()->create('dok.pdf', 100, 'application/pdf')]))
            ->assertSessionHasErrors('thumbnail');

        $this->actingAs($this->admin)
            ->post(route('admin.berita.store'), $this->payload(['thumbnail' => UploadedFile::fake()->image('besar.jpg')->size(3000)]))
            ->assertSessionHasErrors('thumbnail');
    }

    public function test_admin_can_delete_berita_and_its_cover(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('berita/lama.webp', 'x');
        $berita = Berita::factory()->create(['thumbnail' => 'berita/lama.webp']);

        $this->actingAs($this->admin)
            ->delete(route('admin.berita.destroy', $berita))
            ->assertRedirect(route('admin.berita.index'));

        $this->assertModelMissing($berita);
        Storage::disk('public')->assertMissing('berita/lama.webp');
    }

    public function test_create_and_edit_pages_render(): void
    {
        $berita = Berita::factory()->create();

        $this->actingAs($this->admin)->get(route('admin.berita.create'))
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Berita/Create'));

        $this->actingAs($this->admin)->get(route('admin.berita.edit', $berita))
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Berita/Edit')->where('berita.id', $berita->id));
    }

    public function test_alumni_cannot_access_admin_berita(): void
    {
        $alumni = User::factory()->alumni()->create();
        $berita = Berita::factory()->create();

        $this->actingAs($alumni)->get(route('admin.berita.index'))->assertForbidden();
        $this->actingAs($alumni)->post(route('admin.berita.store'), $this->payload())->assertForbidden();
        $this->actingAs($alumni)->delete(route('admin.berita.destroy', $berita))->assertForbidden();
        $this->assertModelExists($berita);
    }
}
