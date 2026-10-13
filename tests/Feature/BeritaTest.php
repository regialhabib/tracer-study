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
}
