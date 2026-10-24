<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\CompleteFirstLoginRequest;
use App\Services\Auth\FirstLoginService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FirstLoginController extends Controller
{
    /**
     * Injeksi dependensi FirstLoginService.
     */
    public function __construct(
        private FirstLoginService $firstLoginService
    ) {}

    /**
     * Menampilkan form onboarding saat login pertama kali.
     */
    public function show(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if (! $user->first_login) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Auth/FirstLogin', [
            'user' => $user->load('profile'),
            'isAdmin' => $user->isAdmin(),
            'consent' => $user->isAlumni() ? config('tracer.consent_text') : null,
        ]);
    }

    /**
     * Menyimpan data onboarding (email, WhatsApp, persetujuan data, kata sandi baru) via FirstLoginService.
     */
    public function update(CompleteFirstLoginRequest $request): RedirectResponse
    {
        $user = $this->firstLoginService->completeOnboarding($request->user(), $request->validated());

        return redirect()
            ->route($user->isAdmin() ? 'admin.dashboard' : 'dashboard')
            ->with('status', 'Alhamdulillah! Akun dan kata sandi baru Anda berhasil disimpan.');
    }
}
