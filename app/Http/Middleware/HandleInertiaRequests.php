<?php

namespace App\Http\Middleware;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? $request->user()->load('profile') : null,
            ],
            'flash' => [
                'status' => session('status'),
                'error' => session('error'),
            ],
            'adminBadges' => fn (): ?array => $this->adminBadges($request),
            'notifikasi' => fn (): ?array => $request->user()
                ? ['unread' => $request->user()->unreadNotifications()->count()]
                : null,
        ];
    }

    /**
     * Angka penanda di sidebar admin (mis. antrean verifikasi). Null untuk non-admin.
     *
     * @return array{verifikasi: int}|null
     */
    private function adminBadges(Request $request): ?array
    {
        if (! $request->user()?->isAdmin()) {
            return null;
        }

        return [
            'verifikasi' => User::query()->alumni()->pending()->count(),
        ];
    }
}
