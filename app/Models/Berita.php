<?php

namespace App\Models;

use App\Enums\BeritaStatus;
use App\Enums\BeritaType;
use Database\Factories\BeritaFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

#[Fillable([
    'author_id',
    'type',
    'title',
    'slug',
    'thumbnail',
    'content',
    'event_date',
    'location',
    'registration_link',
    'status',
    'published_at',
])]
class Berita extends Model
{
    /** @use HasFactory<BeritaFactory> */
    use HasFactory;

    /**
     * Nama tabel terkait.
     *
     * @var string
     */
    protected $table = 'berita';

    /**
     * Atribut turunan yang ikut diserialisasi ke Inertia.
     *
     * @var list<string>
     */
    protected $appends = ['thumbnail_src', 'excerpt'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => BeritaType::class,
            'status' => BeritaStatus::class,
            'event_date' => 'datetime',
            'published_at' => 'datetime',
        ];
    }

    /**
     * Penulis / admin yang menerbitkan berita/agenda ini.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Konten yang tampil di publik: berstatus terbit dan waktu terbitnya sudah lewat (PRD BRT-05).
     */
    #[Scope]
    protected function published(Builder $query): Builder
    {
        return $query->where('status', BeritaStatus::Published->value)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    /**
     * Scope filter berdasarkan tipe (berita, agenda, pengumuman, info_beasiswa).
     */
    #[Scope]
    protected function ofType(Builder $query, BeritaType|string $type): Builder
    {
        return $query->where('type', $type instanceof BeritaType ? $type->value : $type);
    }

    /**
     * Agenda terbit yang belum lewat, urut dari yang terdekat.
     */
    #[Scope]
    protected function upcomingAgenda(Builder $query): Builder
    {
        return $query->published()
            ->ofType(BeritaType::Agenda)
            ->where('event_date', '>=', now())
            ->orderBy('event_date');
    }

    public function isPublished(): bool
    {
        return $this->status === BeritaStatus::Published
            && $this->published_at !== null
            && $this->published_at->lessThanOrEqualTo(now());
    }

    public function isScheduled(): bool
    {
        return $this->status === BeritaStatus::Published
            && $this->published_at !== null
            && $this->published_at->isFuture();
    }

    /**
     * URL sampul siap pakai di `<img src>`; path disk `public` diubah menjadi URL storage.
     */
    protected function thumbnailSrc(): Attribute
    {
        return Attribute::get(function (): ?string {
            $path = $this->attributes['thumbnail'] ?? null;

            if ($path === null || $path === '') {
                return null;
            }

            return str_starts_with($path, 'http') || str_starts_with($path, '/')
                ? $path
                : Storage::disk('public')->url($path);
        });
    }

    /**
     * Cuplikan teks polos dari isi HTML; null bila kolom `content` tidak ikut dimuat.
     */
    protected function excerpt(): Attribute
    {
        return Attribute::get(function (): ?string {
            if (! array_key_exists('content', $this->attributes)) {
                return null;
            }

            $text = html_entity_decode(strip_tags(str_replace(['</p>', '<br>', '</li>', '</h2>', '</h3>'], ' ', (string) $this->attributes['content'])));

            return Str::limit(trim(preg_replace('/\s+/u', ' ', $text)), 180);
        });
    }
}
