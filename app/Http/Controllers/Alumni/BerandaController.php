<?php

namespace App\Http\Controllers\Alumni;

use App\Http\Controllers\Controller;
use App\Services\Alumni\BerandaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BerandaController extends Controller
{
    /**
     * Injeksi dependensi BerandaService.
     */
    public function __construct(
        private BerandaService $berandaService
    ) {}

    /**
     * Menampilkan Beranda alumni; admin dialihkan ke Panel Admin (AUTH-06).
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('Dashboard', $this->berandaService->getBerandaData($user));
    }
}
