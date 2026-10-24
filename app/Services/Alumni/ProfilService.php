<?php

namespace App\Services\Alumni;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProfilService
{
    /**
     * Perbarui akun dan, bila alumni, kontak/domisili/aktivitas saja (data sudah di-whitelist Form Request).
     *
     * @param  array<string, mixed>  $data
     */
    public function update(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data): User {
            $user->fill(array_intersect_key($data, array_flip(['name', 'email'])));

            if ($user->isDirty('email')) {
                $user->email_verified_at = null;
            }

            $user->save();

            $profileData = array_intersect_key($data, array_flip([
                'phone_number', 'city', 'province', 'address', 'current_status',
            ]));

            if ($profileData !== [] && $user->profile !== null) {
                $user->profile->update($profileData);
            }

            return $user;
        });
    }

    /**
     * Simpan foto profil baru, hapus file lama, dan kembalikan path file baru.
     */
    public function storeAvatar(User $user, UploadedFile $file): string
    {
        $profile = $user->profile;
        $oldPath = $profile->avatar_url;
        $newPath = $file->store('avatars', 'public');

        $profile->update(['avatar_url' => $newPath]);

        $this->deleteFile($oldPath);

        return $newPath;
    }

    public function deleteAvatar(User $user): void
    {
        $profile = $user->profile;
        $oldPath = $profile?->avatar_url;

        if ($profile === null || $oldPath === null) {
            return;
        }

        $profile->update(['avatar_url' => null]);

        $this->deleteFile($oldPath);
    }

    private function deleteFile(?string $path): void
    {
        if ($path !== null && $path !== '' && ! str_starts_with($path, 'http')) {
            Storage::disk('public')->delete($path);
        }
    }
}
