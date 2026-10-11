<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class FirstLoginController extends Controller
{
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
     * Memperbarui email, nomor WhatsApp, dan password baru santri.
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

        $user->update([
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'first_login' => false,
        ]);

        if ($user->profile) {
            $user->profile->update([
                'phone_number' => $validated['phone_number'] ?? $user->profile->phone_number,
            ]);
        }

        return redirect()->route('dashboard')->with('status', 'Alhamdulillah! Akun dan password baru Anda berhasil diperbarui.');
    }
}
