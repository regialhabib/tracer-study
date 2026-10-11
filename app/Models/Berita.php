<?php

namespace App\Models;

use Database\Factories\BeritaFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
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
     * Scope untuk berita yang berstatus published.
     */
    #[Scope]
    protected function published(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope filter berdasarkan tipe (berita, agenda, pengumuman, info_beasiswa).
     */
    #[Scope]
    protected function ofType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }
}
