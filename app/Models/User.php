<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\AccountStatus;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable([
    'name',
    'nisn',
    'email',
    'password',
    'role',
    'status',
    'first_login',
    'rejection_reason',
    'verified_at',
    'verified_by',
    'data_consent_at',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'status' => AccountStatus::class,
            'first_login' => 'boolean',
            'verified_at' => 'datetime',
            'data_consent_at' => 'datetime',
        ];
    }

    /**
     * Admin yang memverifikasi (menyetujui/menolak) pendaftaran akun ini.
     */
    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Profil alumni santri (relasi 1:1).
     */
    public function profile(): HasOne
    {
        return $this->hasOne(AlumniProfile::class);
    }

    /**
     * Artikel atau agenda yang dipublikasikan oleh pengguna.
     */
    public function berita(): HasMany
    {
        return $this->hasMany(Berita::class, 'author_id');
    }

    /**
     * Seluruh jawaban kuesioner yang disubmit oleh pengguna.
     */
    public function jawabanKuesioner(): HasMany
    {
        return $this->hasMany(JawabanKuesioner::class);
    }

    /**
     * Ruang percakapan di mana pengguna bertindak sebagai alumni.
     */
    public function conversationsAsAlumni(): HasMany
    {
        return $this->hasMany(Conversation::class, 'alumni_id');
    }

    /**
     * Ruang percakapan di mana pengguna bertindak sebagai admin/ustadz.
     */
    public function conversationsAsAdmin(): HasMany
    {
        return $this->hasMany(Conversation::class, 'admin_id');
    }

    /**
     * Pesan obrolan yang dikirim oleh pengguna.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    /**
     * Mengecek apakah pengguna memiliki peran Admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Mengecek apakah pengguna memiliki peran Alumni.
     */
    public function isAlumni(): bool
    {
        return $this->role === 'alumni';
    }

    /**
     * Mengecek apakah akun berstatus aktif.
     */
    public function isActive(): bool
    {
        return $this->status === AccountStatus::Active;
    }

    /**
     * Mengecek apakah akun masih menunggu verifikasi admin.
     */
    public function isPending(): bool
    {
        return $this->status === AccountStatus::Pending;
    }

    /**
     * Mengecek apakah akun dinonaktifkan (ditolak atau dinonaktifkan admin).
     */
    public function isInactive(): bool
    {
        return $this->status === AccountStatus::Inactive;
    }

    /**
     * Pesan yang ditampilkan saat akun nonaktif mencoba masuk, beserta alasan penolakan bila ada.
     */
    public function deactivatedAccountMessage(): string
    {
        $reason = trim((string) $this->rejection_reason);

        return $reason === ''
            ? __('auth.inactive')
            : __('auth.inactive_with_reason', ['reason' => $reason]);
    }

    /**
     * Scope query pengguna dengan peran Admin.
     */
    #[Scope]
    protected function admin(Builder $query): Builder
    {
        return $query->where('role', 'admin');
    }

    /**
     * Scope query pengguna dengan peran Alumni.
     */
    #[Scope]
    protected function alumni(Builder $query): Builder
    {
        return $query->where('role', 'alumni');
    }

    /**
     * Scope query pengguna dengan status aktif.
     */
    #[Scope]
    protected function active(Builder $query): Builder
    {
        return $query->where('status', AccountStatus::Active);
    }

    /**
     * Scope query pengguna yang menunggu verifikasi admin.
     */
    #[Scope]
    protected function pending(Builder $query): Builder
    {
        return $query->where('status', AccountStatus::Pending);
    }

    /**
     * Scope query pengguna yang dinonaktifkan.
     */
    #[Scope]
    protected function inactive(Builder $query): Builder
    {
        return $query->where('status', AccountStatus::Inactive);
    }
}
