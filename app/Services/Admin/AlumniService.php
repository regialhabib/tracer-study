<?php

namespace App\Services\Admin;

use App\Enums\AccountStatus;
use App\Models\AlumniProfile;
use App\Models\User;
use App\Services\Support\InitialPasswordService;
use App\Services\Support\WhatsAppLinkService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class AlumniService
{
    public const PER_PAGE = 25;

    public function __construct(
        private InitialPasswordService $initialPasswordService,
        private WhatsAppLinkService $whatsAppLinkService,
    ) {}

    /**
     * Query daftar alumni (role alumni) dengan filter yang sama untuk index dan ekspor.
     *
     * @param  array<string, mixed>  $filters  q, angkatan, gender, major, status_kegiatan, status_akun, tampilkan_terhapus
     * @return Builder<User>
     */
    public function query(array $filters): Builder
    {
        $hasProfileFilter = collect($filters)->only(['angkatan', 'gender', 'major', 'status_kegiatan'])->isNotEmpty();

        return User::query()
            ->alumni()
            ->with(['profile' => fn ($query) => $query->withTrashed()])
            ->when(! empty($filters['tampilkan_terhapus']), fn (Builder $query) => $query->withTrashed())
            ->when($filters['q'] ?? null, function (Builder $query, string $keyword) {
                $keyword = '%'.addcslashes($keyword, '%_\\').'%';

                $query->where(fn (Builder $inner) => $inner
                    ->where('name', 'like', $keyword)
                    ->orWhere('nisn', 'like', $keyword));
            })
            ->when($filters['status_akun'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($hasProfileFilter, fn (Builder $query) => $query->whereHas('profile', function (Builder $profile) use ($filters) {
                $profile
                    ->when($filters['angkatan'] ?? null, fn (Builder $q, $year) => $q->where('graduation_year', $year))
                    ->when($filters['gender'] ?? null, fn (Builder $q, $gender) => $q->where('gender', $gender))
                    ->when($filters['major'] ?? null, fn (Builder $q, $major) => $q->where('major', $major))
                    ->when($filters['status_kegiatan'] ?? null, fn (Builder $q, $status) => $q->where('current_status', $status));
            }))
            ->orderBy('name')
            ->orderBy('id');
    }

    /**
     * Daftar alumni terpaginasi untuk halaman index.
     *
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->query($filters)
            ->paginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn (User $user) => $this->toListItem($user));
    }

    /**
     * Mencari akun alumni (termasuk yang sudah dihapus) beserta profilnya.
     */
    public function find(string|int $id): User
    {
        return User::query()
            ->alumni()
            ->withTrashed()
            ->with(['profile' => fn ($query) => $query->withTrashed()])
            ->findOrFail($id);
    }

    /**
     * Opsi filter: tahun lulus dan peminatan yang ada di data.
     *
     * @return array{angkatan: list<int>, majors: list<string>}
     */
    public function filterOptions(): array
    {
        return [
            'angkatan' => AlumniProfile::query()->whereNotNull('graduation_year')->distinct()->orderByDesc('graduation_year')->pluck('graduation_year')->map(fn ($year) => (int) $year)->all(),
            'majors' => AlumniProfile::query()->whereNotNull('major')->distinct()->orderBy('major')->pluck('major')->all(),
        ];
    }

    /**
     * Menambah alumni secara manual (akun aktif, wajib ganti kata sandi saat login pertama).
     *
     * @param  array{user: array<string, mixed>, profile: array<string, mixed>}  $payload
     */
    public function create(array $payload): User
    {
        return DB::transaction(function () use ($payload) {
            $profileData = $payload['profile'];

            $user = User::create([
                ...$payload['user'],
                'password' => $this->initialPasswordService->generate($profileData['birth_date'] ?? null, $payload['user']['nisn'] ?? null),
                'role' => 'alumni',
                'status' => AccountStatus::Active,
                'first_login' => true,
            ]);

            $user->profile()->create($profileData);

            return $user;
        });
    }

    /**
     * Memperbarui akun dan profil alumni.
     *
     * @param  array{user: array<string, mixed>, profile: array<string, mixed>}  $payload
     */
    public function update(User $alumni, array $payload): User
    {
        return DB::transaction(function () use ($alumni, $payload) {
            $alumni->update($payload['user']);

            $alumni->profile()->withTrashed()->updateOrCreate(['user_id' => $alumni->id], $payload['profile']);

            return $alumni;
        });
    }

    /**
     * Mengaktifkan atau menonaktifkan akun alumni.
     */
    public function changeStatus(User $alumni, string $action, ?string $reason): User
    {
        if ($action === 'deactivate') {
            $alumni->update([
                'status' => AccountStatus::Inactive,
                'rejection_reason' => $reason,
            ]);
        } else {
            $alumni->update([
                'status' => AccountStatus::Active,
                'rejection_reason' => null,
            ]);
        }

        return $alumni;
    }

    /**
     * Menghapus (soft delete) akun beserta profilnya.
     */
    public function delete(User $alumni): void
    {
        DB::transaction(function () use ($alumni) {
            $alumni->profile?->delete();
            $alumni->delete();
        });
    }

    /**
     * Memulihkan akun beserta profilnya.
     */
    public function restore(User $alumni): void
    {
        DB::transaction(function () use ($alumni) {
            $alumni->restore();
            $alumni->profile?->restore();
        });
    }

    /**
     * Mereset kata sandi ke kata sandi awal (AUTH-05) dan mewajibkan onboarding ulang.
     *
     * @return array{hint: string, whatsappUrl: ?string}
     */
    public function resetPassword(User $alumni): array
    {
        $birthDate = $alumni->profile?->birth_date;

        $alumni->update([
            'password' => $this->initialPasswordService->generate($birthDate, $alumni->nisn),
            'first_login' => true,
        ]);

        $hint = $this->initialPasswordService->describe($birthDate);

        return [
            'hint' => $hint,
            'whatsappUrl' => $this->whatsAppLinkService->buildTemplateUrl($alumni->profile?->phone_number, 'reset_password', [
                'nama' => $alumni->name,
                'password_hint' => $hint,
                'url' => route('login'),
            ]),
        ];
    }

    /**
     * Keterangan kata sandi awal untuk akun yang baru dibuat.
     */
    public function describeInitialPassword(User $alumni): string
    {
        return $this->initialPasswordService->describe($alumni->profile?->birth_date);
    }

    /**
     * @return array<string, mixed>
     */
    public function toListItem(User $user): array
    {
        $profile = $user->profile;

        return [
            'id' => $user->id,
            'name' => $user->name,
            'nisn' => $user->nisn,
            'avatar_url' => $profile?->avatar_src,
            'graduation_year' => $profile?->graduation_year,
            'major' => $profile?->major,
            'gender' => $profile?->gender,
            'current_status' => $profile?->current_status,
            'status' => $user->status?->value,
            'deleted_at' => $user->deleted_at?->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toDetail(User $user): array
    {
        $profile = $user->profile;

        return [
            ...$this->toListItem($user),
            'email' => $user->email,
            'rejection_reason' => $user->rejection_reason,
            'data_consent_at' => $user->data_consent_at?->toIso8601String(),
            'first_login' => $user->first_login,
            'stambuk_number' => $profile?->stambuk_number,
            'birth_date' => $profile?->birth_date?->format('Y-m-d'),
            'birth_place' => $profile?->birth_place,
            'phone_number' => $profile?->phone_number,
            'entry_year' => $profile?->entry_year,
            'pesantren_program' => $profile?->pesantren_program,
            'tahfidz_count' => $profile?->tahfidz_count,
            'dormitory_complex' => $profile?->dormitory_complex,
            'city' => $profile?->city,
            'province' => $profile?->province,
            'address' => $profile?->address,
            'whatsapp_url' => $this->whatsAppLinkService->buildUrl($profile?->phone_number),
        ];
    }
}
