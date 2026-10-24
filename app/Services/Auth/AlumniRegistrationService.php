<?php

namespace App\Services\Auth;

use App\Enums\AccountStatus;
use App\Enums\AlumniStatus;
use App\Models\AlumniProfile;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AlumniRegistrationService
{
    /**
     * Mendaftarkan santri alumni baru secara mandiri beserta data profilnya.
     *
     * Akun baru berstatus `pending` sampai diverifikasi admin (AUTH-03).
     *
     * @param  array{name: string, email: string, password: string, phone_number: string, nisn?: ?string, gender?: ?string, major?: ?string, graduation_year?: ?int, data_consent?: mixed}  $data
     */
    public function register(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'nisn' => $data['nisn'] ?? null,
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => 'alumni',
                'status' => AccountStatus::Pending,
                'first_login' => false,
                'data_consent_at' => now(),
            ]);

            $graduationYear = (int) ($data['graduation_year'] ?? date('Y'));
            $entryYear = max(2000, $graduationYear - 3);

            AlumniProfile::create([
                'user_id' => $user->id,
                'gender' => $data['gender'] ?? 'L',
                'major' => $data['major'] ?? 'Keagamaan (PK)',
                'entry_year' => $entryYear,
                'graduation_year' => $graduationYear,
                'phone_number' => $data['phone_number'],
                'current_status' => AlumniStatus::MencariKerja->value,
            ]);

            event(new Registered($user));

            return $user;
        });
    }
}
