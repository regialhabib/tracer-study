<?php

namespace App\Http\Controllers;

use App\Http\Requests\AvatarUpdateRequest;
use App\Http\Requests\Pesan\PengaturanPesanRequest;
use App\Http\Requests\ProfileUpdateRequest;
use App\Http\Resources\KontakResource;
use App\Services\Alumni\ProfilService;
use App\Services\Pesan\KontakService;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __construct(private readonly ProfilService $profilService,
        private readonly KontakService $kontakService,
    ) {}

    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $profile = $user->isAlumni() ? $user->profile : null;

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'pesanSettings' => $profile === null ? null : [
                'allow_alumni_messages' => (bool) $profile->allow_alumni_messages,
            ],
            'blockedUsers' => KontakResource::collection($this->kontakService->blockedBy($user))->resolve(),
            'alumni' => $profile === null ? null : [
                'nisn' => $user->nisn,
                'name' => $user->name,
                'email' => $user->email,
                'email_verified' => $user->email_verified_at !== null,
                'gender' => $profile->gender,
                'entry_year' => $profile->entry_year,
                'graduation_year' => $profile->graduation_year,
                'major' => $profile->major,
                'pesantren_program' => $profile->pesantren_program,
                'phone_number' => $profile->phone_number,
                'city' => $profile->city,
                'province' => $profile->province,
                'address' => $profile->address,
                'current_status' => $profile->current_status,
                'avatar_url' => $profile->avatar_src,
            ],
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $this->profilService->update($request->user(), $request->validated());

        return Redirect::route('profile.edit');
    }

    public function updatePesan(PengaturanPesanRequest $request): RedirectResponse
    {
        $this->kontakService->setAllowAlumniMessages($request->user(), $request->boolean('allow_alumni_messages'));

        return Redirect::route('profile.edit')->with('status', 'Pengaturan pesan berhasil disimpan.');
    }

    public function updateAvatar(AvatarUpdateRequest $request): RedirectResponse
    {
        $this->profilService->storeAvatar($request->user(), $request->file('avatar'));

        return Redirect::route('profile.edit');
    }

    public function destroyAvatar(AvatarUpdateRequest $request): RedirectResponse
    {
        $this->profilService->deleteAvatar($request->user());

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
