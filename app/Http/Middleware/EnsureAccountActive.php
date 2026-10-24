<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountActive
{
    /**
     * Hanya akun berstatus aktif yang boleh melanjutkan (AUTH-04).
     *
     * Akun `pending` diarahkan ke halaman "Menunggu Verifikasi"; akun `inactive`
     * dikeluarkan dari sesi lalu dikembalikan ke halaman masuk dengan pesan alasan.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->isActive()) {
            return $next($request);
        }

        if ($user->isPending()) {
            return redirect()->route('verification.pending');
        }

        $message = $user->deactivatedAccountMessage();

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->withErrors(['login' => $message]);
    }
}
