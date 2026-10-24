<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class FirstLoginService
{
    /**
     * Memperbarui informasi login pengguna pada sesi onboarding pertama kali.
     *
     * Alumni: email, nomor WhatsApp, kata sandi baru, dan waktu persetujuan data.
     * Admin: kata sandi baru (email hanya diganti bila diisi).
     *
     * @param  array{email?: ?string, password: string, phone_number?: ?string, data_consent?: mixed}  $data
     */
    public function completeOnboarding(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            $attributes = [
                'password' => Hash::make($data['password']),
                'first_login' => false,
            ];

            if (! empty($data['email'])) {
                $attributes['email'] = $data['email'];
            }

            if ($user->isAlumni()) {
                $attributes['data_consent_at'] = now();
            }

            $user->update($attributes);

            if ($user->isAlumni() && $user->profile) {
                $user->profile->update([
                    'phone_number' => $data['phone_number'] ?? $user->profile->phone_number,
                ]);
            }

            return $user;
        });
    }
}
