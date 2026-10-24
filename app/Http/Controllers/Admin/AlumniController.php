<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AlumniStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AlumniFilterRequest;
use App\Http\Requests\Admin\StoreAlumniRequest;
use App\Http\Requests\Admin\UpdateAlumniRequest;
use App\Http\Requests\Admin\UpdateAlumniStatusRequest;
use App\Services\Admin\AlumniService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AlumniController extends Controller
{
    public function __construct(private AlumniService $alumniService) {}

    /**
     * Daftar alumni dengan pencarian dan filter (ALM-01).
     */
    public function index(AlumniFilterRequest $request): Response
    {
        $filters = $request->filters();

        return Inertia::render('Admin/Alumni/Index', [
            'alumni' => $this->alumniService->paginate($filters),
            'filters' => $filters,
            'filterOptions' => $this->alumniService->filterOptions(),
        ]);
    }

    /**
     * Formulir tambah alumni manual (ALM-03).
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Alumni/Create', [
            'statusOptions' => $this->statusOptions(),
        ]);
    }

    public function store(StoreAlumniRequest $request): RedirectResponse
    {
        $alumni = $this->alumniService->create($request->payload());

        return to_route('admin.alumni.show', $alumni->id)
            ->with('status', 'Alumni berhasil ditambahkan.')
            ->with('passwordInfo', 'Kata sandi awal: '.$this->alumniService->describeInitialPassword($alumni->load('profile')).'. Alumni wajib menggantinya saat masuk pertama kali.');
    }

    /**
     * Detail alumni (ALM-02).
     */
    public function show(string $alumni): Response
    {
        $user = $this->alumniService->find($alumni);

        return Inertia::render('Admin/Alumni/Show', [
            'alumni' => $this->alumniService->toDetail($user),
            'passwordInfo' => session('passwordInfo'),
            'resetWhatsappUrl' => session('resetWhatsappUrl'),
        ]);
    }

    public function edit(string $alumni): Response
    {
        $user = $this->alumniService->find($alumni);

        return Inertia::render('Admin/Alumni/Edit', [
            'alumni' => $this->alumniService->toDetail($user),
            'statusOptions' => $this->statusOptions(),
        ]);
    }

    public function update(UpdateAlumniRequest $request, string $alumni): RedirectResponse
    {
        $user = $this->alumniService->find($alumni);

        $this->alumniService->update($user, $request->payload());

        return to_route('admin.alumni.show', $user->id)->with('status', 'Data alumni berhasil diperbarui.');
    }

    /**
     * Mengaktifkan atau menonaktifkan akun alumni.
     */
    public function updateStatus(UpdateAlumniStatusRequest $request, string $alumni): RedirectResponse
    {
        $user = $this->alumniService->find($alumni);

        $this->alumniService->changeStatus($user, $request->validated('action'), $request->validated('reason'));

        return back()->with('status', $request->validated('action') === 'deactivate'
            ? 'Akun alumni dinonaktifkan.'
            : 'Akun alumni diaktifkan.');
    }

    /**
     * Hapus (soft delete) alumni.
     */
    public function destroy(string $alumni): RedirectResponse
    {
        $this->alumniService->delete($this->alumniService->find($alumni));

        return to_route('admin.alumni.index')->with('status', 'Alumni dihapus. Data masih bisa dipulihkan.');
    }

    public function restore(string $alumni): RedirectResponse
    {
        $this->alumniService->restore($this->alumniService->find($alumni));

        return to_route('admin.alumni.show', $alumni)->with('status', 'Alumni berhasil dipulihkan.');
    }

    /**
     * Reset kata sandi alumni ke kata sandi awal (AUTH-05).
     */
    public function resetPassword(string $alumni): RedirectResponse
    {
        $result = $this->alumniService->resetPassword($this->alumniService->find($alumni));

        return back()
            ->with('status', 'Kata sandi berhasil direset.')
            ->with('passwordInfo', 'Kata sandi sementara: '.$result['hint'].'. Alumni wajib menggantinya saat masuk.')
            ->with('resetWhatsappUrl', $result['whatsappUrl']);
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function statusOptions(): array
    {
        return collect(AlumniStatus::cases())
            ->map(fn (AlumniStatus $status) => ['value' => $status->value, 'label' => $status->label()])
            ->all();
    }
}
