<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Auth\FirstLoginService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
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
     * Menampilkan form onboarding bagi santri saat login pertama kali.
     */
    public function show(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if (! $user->first_login) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Auth/FirstLogin', [
            'user' => $user->load('profile'),
        ]);
    }

    /**
     * Memperbarui email, nomor WhatsApp, dan password baru santri via FirstLoginService.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($user->id),
            ],
            'phone_number' => ['nullable', 'string', 'max:25'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $this->firstLoginService->completeOnboarding($user, $validated);

        return redirect()->route('dashboard')->with('status', 'Alhamdulillah! Akun dan password baru Anda berhasil diperbarui.');
    }
}
