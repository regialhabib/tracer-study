<?php

namespace App\Http\Controllers\Pesan;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Pesan\PesanPermission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class BlokirController extends Controller
{
    public function __construct(private readonly PesanPermission $permission) {}

    public function store(Request $request, User $user): RedirectResponse
    {
        abort_unless($this->permission->canBlock($request->user(), $user), 403, 'Anda tidak dapat memblokir pengguna ini.');

        $request->user()->blockedUsers()->syncWithoutDetaching([$user->id]);

        return back()->with('status', "{$user->name} telah diblokir.");
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $request->user()->blockedUsers()->detach($user->id);

        return back()->with('status', "Blokir terhadap {$user->name} telah dibuka.");
    }
}
