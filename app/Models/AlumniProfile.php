<?php

namespace App\Models;

use Database\Factories\AlumniProfileFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

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
    'allow_alumni_messages',
])]
class AlumniProfile extends Model
{
    /** @use HasFactory<AlumniProfileFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @var list<string>
     */
    protected $appends = ['avatar_src'];

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
            'allow_alumni_messages' => 'boolean',
        ];
    }

    /**
     * URL publik foto profil. `avatar_url` menyimpan path di disk `public`;
     * nilai yang sudah berupa URL penuh atau path absolut dibiarkan apa adanya.
     *
     * @return Attribute<?string, never>
     */
    protected function avatarSrc(): Attribute
    {
        return Attribute::get(function (): ?string {
            $path = $this->avatar_url;

            if ($path === null || $path === '') {
                return null;
            }

            return str_starts_with($path, 'http') || str_starts_with($path, '/')
                ? $path
                : Storage::disk('public')->url($path);
        });
    }

    /**
     * Relasi ke akun User pemilik profil ini.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
