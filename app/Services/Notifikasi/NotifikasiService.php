<?php

namespace App\Services\Notifikasi;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Collection;

/**
 * Membaca dan menandai notifikasi dalam aplikasi milik seorang pengguna (PRD NTF-02).
 */
class NotifikasiService
{
    /**
     * @return array{id: string, kind: ?string, title: ?string, message: ?string, url: ?string, read_at: ?string, created_at: ?string}
     */
    public function toItem(DatabaseNotification $notification): array
    {
        return [
            'id' => $notification->id,
            'kind' => $notification->data['kind'] ?? null,
            'title' => $notification->data['title'] ?? null,
            'message' => $notification->data['message'] ?? null,
            'url' => $notification->data['url'] ?? null,
            'read_at' => $notification->read_at?->toIso8601String(),
            'created_at' => $notification->created_at?->toIso8601String(),
        ];
    }

    public function paginate(User $user, int $perPage = 20): LengthAwarePaginator
    {
        return $user->notifications()
            ->latest()
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (DatabaseNotification $notification): array => $this->toItem($notification));
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function recent(User $user, int $limit = 8): Collection
    {
        return $user->notifications()
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (DatabaseNotification $notification): array => $this->toItem($notification));
    }

    public function unreadCount(User $user): int
    {
        return $user->unreadNotifications()->count();
    }

    /**
     * Tandai terbaca; mengembalikan null bila bukan milik pengguna.
     */
    public function markAsRead(User $user, string $id): ?DatabaseNotification
    {
        $notification = $user->notifications()->whereKey($id)->first();
        $notification?->markAsRead();

        return $notification;
    }

    public function markAllAsRead(User $user): void
    {
        $user->unreadNotifications()->update(['read_at' => now()]);
    }
}
