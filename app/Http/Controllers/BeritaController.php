<?php

namespace App\Http\Controllers;

use App\Models\Berita;
use Inertia\Inertia;
use Inertia\Response;

class BeritaController extends Controller
{
    /**
     * Menampilkan halaman detail berita, agenda, atau pengumuman.
     */
    public function show(Berita $berita): Response
    {
        abort_if($berita->status !== 'published', 404);

        $berita->load('author:id,name');

        $beritaTerkait = Berita::published()
            ->where('id', '!=', $berita->id)
            ->latest('published_at')
            ->take(3)
            ->get(['id', 'title', 'slug', 'type', 'thumbnail', 'published_at', 'author_id']);

        return Inertia::render('Berita/Show', [
            'berita' => $berita,
            'beritaTerkait' => $beritaTerkait,
        ]);
    }
}
