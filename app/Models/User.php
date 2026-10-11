<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'nisn', 'email', 'password', 'role', 'status', 'first_login'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

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
            'first_login' => 'boolean',
        ];
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
        return $query->where('status', 'active');
    }
}
