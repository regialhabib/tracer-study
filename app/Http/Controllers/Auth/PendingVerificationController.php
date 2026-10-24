<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PendingVerificationController extends Controller
{
    /**
     * Menampilkan halaman "Menunggu Verifikasi" bagi pendaftar mandiri (AUTH-04).
     */
    public function __invoke(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if (! $user->isPending()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Auth/PendingVerification', [
            'name' => $user->name,
            'phoneNumber' => $user->profile?->phone_number,
            'registeredAt' => $user->created_at?->toIso8601String(),
        ]);
    }
}
