<?php

namespace Tests\Feature;

use App\Models\Berita;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BeritaTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_render_published_news_detail_page(): void
    {
        $admin = User::factory()->admin()->create();
        $berita = Berita::factory()->create([
            'author_id' => $admin->id,
            'status' => 'published',
            'title' => 'Pengajian Akbar Santri Riyadhul Amien',
        ]);

        $response = $this->get(route('berita.show', $berita->slug));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Berita/Show')
            ->where('berita.id', $berita->id)
            ->where('berita.title', $berita->title)
            ->has('beritaTerkait')
        );
    }

    public function test_cannot_access_draft_news_detail(): void
    {
        $admin = User::factory()->admin()->create();
        $berita = Berita::factory()->draft()->create([
            'author_id' => $admin->id,
        ]);

        $response = $this->get(route('berita.show', $berita->slug));

        $response->assertNotFound();
    }

    public function test_displays_event_details_for_agenda_type(): void
    {
        $admin = User::factory()->admin()->create();
        $agenda = Berita::factory()->agenda()->create([
            'author_id' => $admin->id,
            'status' => 'published',
            'location' => 'Aula Utama Pesantren',
        ]);

        $response = $this->get(route('berita.show', $agenda->slug));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Berita/Show')
            ->where('berita.type', 'agenda')
            ->where('berita.location', 'Aula Utama Pesantren')
        );
    }

    protected function setUp(): void
    {
        parent::setUp();

        // Halaman Berita/Index baru masuk manifest Vite setelah `npm run build`.
        $this->withoutVite();
    }

    public function test_scheduled_news_is_hidden_from_index_and_detail_is_not_found(): void
    {
        $terjadwal = Berita::factory()->scheduled()->create();
        $terbit = Berita::factory()->create();

        $this->get(route('berita.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Berita/Index')
                ->has('beritaList.data', 1)
                ->where('beritaList.data.0.id', $terbit->id)
            );

        $this->get(route('berita.show', $terjadwal->slug))->assertNotFound();
    }

    public function test_index_excludes_drafts_and_does_not_send_full_content(): void
    {
        Berita::factory()->draft()->create();
        Berita::factory()->create();

        $this->get(route('berita.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('beritaList.data', 1)
                ->missing('beritaList.data.0.content')
                ->has('beritaList.data.0.excerpt')
            );
    }

    public function test_index_filters_by_type_and_paginates_nine_per_page(): void
    {
        Berita::factory()->count(10)->create(['type' => 'berita']);
        Berita::factory()->agenda()->create();

        $this->get(route('berita.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('beritaList.data', 9)
                ->where('beritaList.total', 11)
            );

        $this->get(route('berita.index', ['tipe' => 'agenda']))
            ->assertInertia(fn (Assert $page) => $page
                ->has('beritaList.data', 1)
                ->where('beritaList.data.0.type', 'agenda')
                ->where('tipe', 'agenda')
            );
    }

    public function test_index_ignores_unknown_type_filter(): void
    {
        Berita::factory()->count(2)->create();

        $this->get(route('berita.index', ['tipe' => 'tidak-ada']))
            ->assertInertia(fn (Assert $page) => $page
                ->has('beritaList.data', 2)
                ->where('tipe', null)
            );
    }
}
