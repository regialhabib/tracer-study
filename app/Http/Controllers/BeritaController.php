<?php

namespace App\Http\Controllers;

use App\Enums\BeritaType;
use App\Models\Berita;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BeritaController extends Controller
{
    /**
     * Menampilkan daftar kabar terbit (berita, agenda, pengumuman, info beasiswa) dengan filter tipe.
     */
    public function index(Request $request): Response
    {
        $tipe = BeritaType::tryFrom((string) $request->query('tipe'));

        $beritaList = Berita::published()
            ->when($tipe, fn ($query) => $query->ofType($tipe))
            ->latest('published_at')
            ->paginate(9, ['id', 'title', 'slug', 'type', 'thumbnail', 'content', 'event_date', 'published_at'])
            ->withQueryString()
            ->through(fn (Berita $berita) => $berita->makeHidden('content'));

        return Inertia::render('Berita/Index', [
            'beritaList' => $beritaList,
            'tipe' => $tipe?->value,
            'tipeOptions' => collect(BeritaType::cases())
                ->map(fn (BeritaType $type) => ['value' => $type->value, 'label' => $type->label()])
                ->values(),
        ]);
    }

    /**
     * Menampilkan halaman detail berita, agenda, atau pengumuman.
     */
    public function show(Berita $berita): Response
    {
        abort_unless($berita->isPublished(), 404);

        $berita->load('author:id,name');

        $beritaTerkait = Berita::published()
            ->where('id', '!=', $berita->id)
            ->latest('published_at')
            ->take(3)
            ->get(['id', 'title', 'slug', 'type', 'thumbnail', 'content', 'published_at', 'author_id'])
            ->each->makeHidden('content');

        return Inertia::render('Berita/Show', [
            'berita' => $berita,
            'beritaTerkait' => $beritaTerkait,
        ]);
    }
}
