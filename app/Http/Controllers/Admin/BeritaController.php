<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BeritaFilterRequest;
use App\Http\Requests\Admin\StoreBeritaRequest;
use App\Http\Requests\Admin\UpdateBeritaRequest;
use App\Models\Berita;
use App\Services\Admin\BeritaService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BeritaController extends Controller
{
    public function __construct(private BeritaService $beritaService) {}

    /**
     * Daftar berita, agenda, dan pengumuman (BRT-01).
     */
    public function index(BeritaFilterRequest $request): Response
    {
        return Inertia::render('Admin/Berita/Index', [
            'berita' => $this->beritaService->paginate($request->filters()),
            'filters' => $request->filters(),
            'options' => $this->beritaService->options(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Berita/Create', [
            'options' => $this->beritaService->options(),
        ]);
    }

    public function store(StoreBeritaRequest $request): RedirectResponse
    {
        $this->beritaService->create($request->payload(), $request->user(), $request->file('thumbnail'));

        return to_route('admin.berita.index')->with('status', 'Berita berhasil disimpan.');
    }

    public function edit(Berita $berita): Response
    {
        return Inertia::render('Admin/Berita/Edit', [
            'berita' => $this->beritaService->toFormData($berita),
            'options' => $this->beritaService->options(),
        ]);
    }

    public function update(UpdateBeritaRequest $request, Berita $berita): RedirectResponse
    {
        $this->beritaService->update(
            $berita,
            $request->payload(),
            $request->file('thumbnail'),
            $request->boolean('remove_thumbnail'),
        );

        return to_route('admin.berita.index')->with('status', 'Perubahan berita berhasil disimpan.');
    }

    public function destroy(Berita $berita): RedirectResponse
    {
        $this->beritaService->delete($berita);

        return to_route('admin.berita.index')->with('status', 'Berita dihapus.');
    }
}
