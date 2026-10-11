<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class FirstLoginService
{
    /**
     * Memperbarui informasi login santri pada sesi onboarding pertama kali.
     *
     * @param  array{email: string, password: string, phone_number?: ?string}  $data
     */
    public function completeOnboarding(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            $user->update([
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'first_login' => false,
            ]);

            if ($user->profile) {
                $user->profile->update([
                    'phone_number' => $data['phone_number'] ?? $user->profile->phone_number,
                ]);
            }

            return $user;
        });
    }
}
