<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Data kontak yang aman dibagikan ke pengguna lain (PRD MSG-06).
 * Sengaja TIDAK memuat email, NISN, nomor WA, alamat, atau tanggal lahir.
 *
 * Muat relasi `profile` sebelum dipakai agar tidak N+1.
 *
 * @mixin User
 */
class KontakResource extends JsonResource
{
    /**
     * @return array{id: int, name: string, avatar_src: ?string, is_admin: bool, angkatan: ?int, major: ?string}
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'avatar_src' => $this->profile?->avatar_src,
            'is_admin' => $this->isAdmin(),
            'angkatan' => $this->isAlumni() ? $this->profile?->graduation_year : null,
            'major' => $this->isAlumni() ? $this->profile?->major : null,
        ];
    }
}
