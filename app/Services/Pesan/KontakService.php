<?php

namespace App\Services\Pesan;

use App\Models\AlumniProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class KontakService
{
    private const PER_PAGE = 12;

    /**
     * Cari kontak yang boleh dihubungi oleh pencari.
     *
     * @param  array{q?: ?string, angkatan?: int|string|null, peminatan?: ?string}  $filters
     * @return LengthAwarePaginator<int, User>
     */
    public function search(User $searcher, array $filters): LengthAwarePaginator
    {
        $q = trim((string) ($filters['q'] ?? ''));
        $angkatan = $filters['angkatan'] ?? null;
        $peminatan = $filters['peminatan'] ?? null;
        $hasProfileFilter = filled($angkatan) || filled($peminatan);

        return User::query()
            ->with('profile')
            ->active()
            ->whereKeyNot($searcher->id)
            ->whereNotIn('id', $searcher->blockedBy()->select('users.id'))
            ->when($searcher->isAlumni(), function (Builder $query): void {
                $query->where(function (Builder $inner): void {
                    $inner->where('role', 'admin')
                        ->orWhereHas('profile', fn (Builder $profile) => $profile->where('allow_alumni_messages', true));
                });
            })
            ->when($q !== '', fn (Builder $query) => $query->where('name', 'like', '%'.addcslashes($q, '%_\\').'%'))
            ->when($hasProfileFilter, function (Builder $query) use ($angkatan, $peminatan): void {
                $query->where('role', 'alumni')->whereHas('profile', function (Builder $profile) use ($angkatan, $peminatan): void {
                    $profile
                        ->when(filled($angkatan), fn (Builder $p) => $p->where('graduation_year', (int) $angkatan))
                        ->when(filled($peminatan), fn (Builder $p) => $p->where('major', $peminatan));
                });
            })
            ->orderBy('name')
            ->paginate(self::PER_PAGE)
            ->withQueryString();
    }

    /**
     * @return array{angkatan: list<int>, peminatan: list<string>}
     */
    public function filterOptions(): array
    {
        $profiles = AlumniProfile::query()
            ->whereHas('user', fn (Builder $user) => $user->active()->where('role', 'alumni'));

        return [
            'angkatan' => (clone $profiles)->whereNotNull('graduation_year')->distinct()
                ->orderByDesc('graduation_year')->pluck('graduation_year')->map(fn ($year) => (int) $year)->all(),
            'peminatan' => (clone $profiles)->whereNotNull('major')->where('major', '!=', '')->distinct()
                ->orderBy('major')->pluck('major')->all(),
        ];
    }

    /**
     * Pengguna yang diblokir oleh $user, siap dikirim lewat KontakResource.
     *
     * @return Collection<int, User>
     */
    public function blockedBy(User $user)
    {
        return $user->blockedUsers()->with('profile')->orderBy('name')->get();
    }

    public function setAllowAlumniMessages(User $user, bool $allow): void
    {
        $user->profile?->update(['allow_alumni_messages' => $allow]);
    }
}
