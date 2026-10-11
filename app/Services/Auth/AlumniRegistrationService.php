<?php

namespace App\Services\Auth;

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
     * @param  array{name: string, email: string, password: string, nisn?: ?string, gender?: ?string, major?: ?string, graduation_year?: ?int, phone_number?: ?string}  $data
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
                'status' => 'active',
                'first_login' => false,
            ]);

            $graduationYear = (int) ($data['graduation_year'] ?? date('Y'));
            $entryYear = max(2000, $graduationYear - 3);

            AlumniProfile::create([
                'user_id' => $user->id,
                'gender' => $data['gender'] ?? 'L',
                'major' => $data['major'] ?? 'Keagamaan (PK)',
                'entry_year' => $entryYear,
                'graduation_year' => $graduationYear,
                'phone_number' => $data['phone_number'] ?? null,
                'current_status' => 'mencari_kerja',
            ]);

            event(new Registered($user));

            return $user;
        });
    }
}
