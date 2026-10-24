<?php

namespace App\Models;

use Database\Factories\AlumniProfileFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'user_id',
    'stambuk_number',
    'gender',
    'birth_date',
    'birth_place',
    'phone_number',
    'entry_year',
    'graduation_year',
    'major',
    'pesantren_program',
    'tahfidz_count',
    'dormitory_complex',
    'current_status',
    'city',
    'province',
    'address',
    'avatar_url',
])]
class AlumniProfile extends Model
{
    /** @use HasFactory<AlumniProfileFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'entry_year' => 'integer',
            'graduation_year' => 'integer',
            'tahfidz_count' => 'integer',
        ];
    }

    /**
     * Relasi ke akun User pemilik profil ini.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
