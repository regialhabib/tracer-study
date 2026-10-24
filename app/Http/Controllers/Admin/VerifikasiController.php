<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RejectRegistrationRequest;
use App\Models\User;
use App\Services\Admin\VerifikasiService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VerifikasiController extends Controller
{
    public function __construct(private VerifikasiService $verifikasiService) {}

    /**
     * Antrean pendaftar mandiri yang menunggu verifikasi.
     */
    public function index(Request $request): Response
    {
        $queue = $this->verifikasiService->pendingQueue();

        $queue->through(fn (User $user): array => [
            'id' => $user->id,
            'name' => $user->name,
            'nisn' => $user->nisn,
            'email' => $user->email,
            'phone_number' => $user->profile?->phone_number,
            'graduation_year' => $user->profile?->graduation_year,
            'major' => $user->profile?->major,
            'registered_at' => $user->created_at?->toIso8601String(),
        ]);

        return Inertia::render('Admin/Verifikasi/Index', [
            'registrations' => $queue,
            'whatsappUrl' => session('whatsappUrl'),
            'whatsappName' => session('whatsappName'),
        ]);
    }

    public function approve(Request $request, User $user): RedirectResponse
    {
        $whatsappUrl = $this->verifikasiService->approve($user, $request->user());

        return $this->backToQueue("Pendaftaran {$user->name} telah disetujui.", $user->name, $whatsappUrl);
    }

    public function reject(RejectRegistrationRequest $request, User $user): RedirectResponse
    {
        $this->verifikasiService->reject($user, $request->validated('rejection_reason'));

        return $this->backToQueue("Pendaftaran {$user->name} telah ditolak.");
    }

    private function backToQueue(string $message, ?string $name = null, ?string $whatsappUrl = null): RedirectResponse
    {
        $redirect = to_route('admin.verifikasi.index')->with('status', $message);

        if ($whatsappUrl !== null) {
            $redirect->with('whatsappUrl', $whatsappUrl)->with('whatsappName', $name);
        }

        return $redirect;
    }
}
