<?php

namespace App\Services\Admin;

use App\Enums\BeritaStatus;
use App\Enums\BeritaType;
use App\Models\Berita;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Format;
use Intervention\Image\ImageManager;
use Mews\Purifier\Facades\Purifier;

class BeritaService
{
    public const PER_PAGE = 15;

    public const COVER_MAX_WIDTH = 1600;

    public const COVER_QUALITY = 80;

    /**
     * Daftar berita terpaginasi (tanpa kolom isi) untuk halaman index admin.
     *
     * @param  array{q?: string, tipe?: string, status?: string}  $filters
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function paginate(array $filters): LengthAwarePaginator
    {
        return Berita::query()
            ->select(['id', 'type', 'title', 'slug', 'thumbnail', 'status', 'published_at', 'event_date', 'created_at'])
            ->when($filters['q'] ?? null, function (Builder $query, string $keyword) {
                $query->where('title', 'like', '%'.addcslashes($keyword, '%_\\').'%');
            })
            ->when($filters['tipe'] ?? null, fn (Builder $query, string $type) => $query->where('type', $type))
            ->when($filters['status'] ?? null, function (Builder $query, string $status) {
                match ($status) {
                    'draf' => $query->where('status', BeritaStatus::Draft->value),
                    'terjadwal' => $query->where('status', BeritaStatus::Published->value)->where('published_at', '>', now()),
                    'terbit' => $query->where('status', BeritaStatus::Published->value)->where('published_at', '<=', now()),
                    default => null,
                };
            })
            ->latest('created_at')
            ->latest('id')
            ->paginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn (Berita $berita): array => $this->toListItem($berita));
    }

    /**
     * @return array<string, mixed>
     */
    public function toListItem(Berita $berita): array
    {
        return [
            'id' => $berita->id,
            'title' => $berita->title,
            'slug' => $berita->slug,
            'type' => $berita->type->value,
            'type_label' => $berita->type->label(),
            'state' => $this->stateOf($berita),
            'thumbnail_src' => $berita->thumbnail_src,
            'published_at' => $berita->published_at?->toIso8601String(),
            'event_date' => $berita->event_date?->toIso8601String(),
        ];
    }

    /**
     * Bentuk data untuk formulir ubah; tanggal berformat `datetime-local`.
     *
     * @return array<string, mixed>
     */
    public function toFormData(Berita $berita): array
    {
        return [
            'id' => $berita->id,
            'type' => $berita->type->value,
            'title' => $berita->title,
            'slug' => $berita->slug,
            'content' => $berita->content,
            'thumbnail_src' => $berita->thumbnail_src,
            'status' => $berita->status->value,
            'published_at' => $berita->published_at?->format('Y-m-d\TH:i'),
            'event_date' => $berita->event_date?->format('Y-m-d\TH:i'),
            'location' => $berita->location,
            'registration_link' => $berita->registration_link,
            'is_published' => $berita->isPublished(),
        ];
    }

    /**
     * Opsi tipe dan status untuk filter dan formulir.
     *
     * @return array{types: list<array{value: string, label: string}>, statuses: list<array{value: string, label: string}>}
     */
    public function options(): array
    {
        return [
            'types' => collect(BeritaType::cases())
                ->map(fn (BeritaType $type) => ['value' => $type->value, 'label' => $type->label()])
                ->all(),
            'statuses' => collect(BeritaStatus::cases())
                ->map(fn (BeritaStatus $status) => ['value' => $status->value, 'label' => $status->label()])
                ->all(),
        ];
    }

    /**
     * Membuat berita baru.
     *
     * @param  array<string, mixed>  $data  Data tervalidasi (tanpa berkas sampul).
     */
    public function create(array $data, User $author, ?UploadedFile $thumbnail = null): Berita
    {
        $attributes = $this->prepareAttributes($data);
        $attributes['author_id'] = $author->id;
        $attributes['slug'] = $this->uniqueSlug($attributes['title']);
        $attributes['thumbnail'] = $thumbnail ? $this->storeCover($thumbnail) : null;

        return DB::transaction(fn () => Berita::create($attributes));
    }

    /**
     * Memperbarui berita; slug tetap setelah pernah memiliki jadwal terbit.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(Berita $berita, array $data, ?UploadedFile $thumbnail = null, bool $removeThumbnail = false): Berita
    {
        $attributes = $this->prepareAttributes($data);
        $oldThumbnail = $berita->thumbnail;

        if ($berita->published_at === null && $attributes['title'] !== $berita->title) {
            $attributes['slug'] = $this->uniqueSlug($attributes['title'], $berita->id);
        }

        if ($thumbnail) {
            $attributes['thumbnail'] = $this->storeCover($thumbnail);
        } elseif ($removeThumbnail) {
            $attributes['thumbnail'] = null;
        }

        DB::transaction(fn () => $berita->update($attributes));

        if (array_key_exists('thumbnail', $attributes)) {
            $this->deleteCover($oldThumbnail);
        }

        return $berita;
    }

    public function delete(Berita $berita): void
    {
        $thumbnail = $berita->thumbnail;

        $berita->delete();

        $this->deleteCover($thumbnail);
    }

    /**
     * Status tampilan: draft, scheduled (terjadwal), atau published.
     */
    public function stateOf(Berita $berita): string
    {
        if ($berita->status === BeritaStatus::Draft) {
            return 'draft';
        }

        return $berita->isScheduled() ? 'scheduled' : 'published';
    }

    /**
     * Sanitasi isi, kosongkan field agenda untuk tipe lain, dan tentukan waktu terbit.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function prepareAttributes(array $data): array
    {
        $type = BeritaType::from($data['type']);
        $status = BeritaStatus::from($data['status']);
        $isAgenda = $type->requiresEventFields();

        return [
            'type' => $type,
            'title' => trim($data['title']),
            'content' => Purifier::clean($data['content'], 'berita'),
            'status' => $status,
            'published_at' => $status === BeritaStatus::Published ? ($data['published_at'] ?? now()) : null,
            'event_date' => $isAgenda ? $data['event_date'] : null,
            'location' => $isAgenda ? $data['location'] : null,
            'registration_link' => $isAgenda ? $data['registration_link'] : null,
        ];
    }

    private function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::limit(Str::slug($title), 200, '') ?: 'berita';
        $slug = $base;
        $counter = 2;

        while (Berita::query()
            ->when($ignoreId, fn (Builder $query) => $query->where('id', '!=', $ignoreId))
            ->where('slug', $slug)
            ->exists()) {
            $slug = $base.'-'.$counter++;
        }

        return $slug;
    }

    /**
     * Mengubah sampul menjadi webp (lebar maks 1600 px) dan menyimpannya di disk public.
     */
    private function storeCover(UploadedFile $file): string
    {
        $encoded = (new ImageManager(new Driver))
            ->decodeSplFileInfo($file)
            ->scaleDown(width: self::COVER_MAX_WIDTH)
            ->encodeUsingFormat(Format::WEBP, quality: self::COVER_QUALITY);

        $path = 'berita/'.Str::uuid().'.webp';

        Storage::disk('public')->put($path, $encoded->toString());

        return $path;
    }

    private function deleteCover(?string $path): void
    {
        if ($path !== null && $path !== '' && ! str_starts_with($path, 'http') && ! str_starts_with($path, '/')) {
            Storage::disk('public')->delete($path);
        }
    }
}
