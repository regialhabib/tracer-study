<?php

namespace App\Services\Admin;

use App\Enums\AccountStatus;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AdminUserService
{
    /**
     * Daftar akun admin (semua status), nama A-Z.
     */
    public function paginate(int $perPage = 25): LengthAwarePaginator
    {
        return User::query()->admin()->orderBy('name')->paginate($perPage)->withQueryString();
    }

    /**
     * Membuat admin baru: aktif dan wajib onboarding saat login pertama.
     *
     * @param  array{name: string, email: string, password: string}  $data
     */
    public function create(array $data): User
    {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'admin',
            'status' => AccountStatus::Active,
            'first_login' => true,
        ]);
    }

    /**
     * @param  array{name: string, email: string}  $data
     */
    public function update(User $adminUser, array $data): User
    {
        $adminUser->update(['name' => $data['name'], 'email' => $data['email']]);

        return $adminUser;
    }

    /**
     * Menonaktifkan admin dengan dua penjaga: bukan diri sendiri, bukan admin aktif terakhir.
     *
     * @throws ValidationException
     */
    public function deactivate(User $adminUser, User $actor): User
    {
        if ($adminUser->is($actor)) {
            throw ValidationException::withMessages([
                'status' => 'Anda tidak dapat menonaktifkan akun Anda sendiri.',
            ]);
        }

        if ($adminUser->isActive() && User::query()->admin()->active()->count() <= 1) {
            throw ValidationException::withMessages([
                'status' => 'Akun ini adalah satu-satunya admin aktif, sehingga tidak dapat dinonaktifkan.',
            ]);
        }

        $adminUser->update(['status' => AccountStatus::Inactive]);

        return $adminUser;
    }

    public function activate(User $adminUser): User
    {
        $adminUser->update(['status' => AccountStatus::Active, 'rejection_reason' => null]);

        return $adminUser;
    }
}
