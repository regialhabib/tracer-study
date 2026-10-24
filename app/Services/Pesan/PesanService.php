<?php

namespace App\Services\Pesan;

use App\Events\PesanDibaca;
use App\Events\PesanMasuk;
use App\Events\PesanTerkirim;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Notifications\PesanBaruNotification;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class PesanService
{
    public const PAGE_SIZE = 30;

    /**
     * Daftar percakapan pengguna (terbaru dulu, tanpa pesan terakhir di akhir), opsional dicari lewat nama lawan bicara.
     *
     * @return Collection<int, Conversation>
     */
    public function inbox(User $user, ?string $search = null): Collection
    {
        $search = trim((string) $search);
        $like = '%'.addcslashes($search, '%_\\').'%';

        return Conversation::query()
            ->forUser($user)
            ->when($search !== '', fn (Builder $query) => $query->where(fn (Builder $nested) => $nested
                ->where(fn (Builder $one) => $one->where('user_one_id', $user->id)
                    ->whereHas('userTwo', fn (Builder $other) => $other->where('name', 'like', $like)))
                ->orWhere(fn (Builder $two) => $two->where('user_two_id', $user->id)
                    ->whereHas('userOne', fn (Builder $other) => $other->where('name', 'like', $like)))))
            ->with(['userOne.profile', 'userTwo.profile', 'latestMessage'])
            ->withCount(['messages as unread_count' => fn (Builder $query) => $query
                ->where('is_read', false)
                ->where('sender_id', '!=', $user->id)])
            ->orderByRaw('last_message_at is null')
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->get();
    }

    /**
     * Ambil atau buat percakapan antara dua pengguna (pasangan terurut, tidak ganda).
     */
    public function startConversation(User $starter, User $other): Conversation
    {
        [$userOneId, $userTwoId] = Conversation::orderedPair($starter, $other);

        return Conversation::firstOrCreate([
            'user_one_id' => $userOneId,
            'user_two_id' => $userTwoId,
        ]);
    }

    /**
     * Satu halaman riwayat (lama ke baru), berisi pesan sebelum `$beforeId`.
     *
     * @return array{data: \Illuminate\Support\Collection<int, Message>, has_more: bool}
     */
    public function history(Conversation $conversation, ?int $beforeId = null): array
    {
        $messages = $conversation->messages()
            ->when($beforeId, fn (Builder $query) => $query->where('id', '<', $beforeId))
            ->orderByDesc('id')
            ->limit(self::PAGE_SIZE + 1)
            ->get();

        $hasMore = $messages->count() > self::PAGE_SIZE;

        return [
            'data' => $messages->take(self::PAGE_SIZE)->reverse()->values(),
            'has_more' => $hasMore,
        ];
    }

    /**
     * Simpan pesan, perbarui waktu pesan terakhir, lalu siarkan & beri notifikasi ke penerima.
     */
    public function send(Conversation $conversation, User $sender, string $body): Message
    {
        $message = DB::transaction(function () use ($conversation, $sender, $body): Message {
            $message = $conversation->messages()->create([
                'sender_id' => $sender->id,
                'message' => $body,
            ]);

            $conversation->update(['last_message_at' => $message->created_at]);

            return $message;
        });

        $recipient = $conversation->otherParticipant($sender);

        broadcast(new PesanTerkirim($message))->toOthers();
        broadcast(new PesanMasuk($message, $recipient->id, $this->unreadTotal($recipient)));

        $this->notifyRecipient($recipient, $sender, $message);

        return $message;
    }

    /**
     * Tandai pesan lawan bicara sebagai dibaca; mengembalikan jumlah yang diubah.
     */
    public function markAsRead(Conversation $conversation, User $reader): int
    {
        $readAt = now();

        $updated = $conversation->messages()
            ->unread()
            ->where('sender_id', '!=', $reader->id)
            ->update(['is_read' => true, 'read_at' => $readAt]);

        if ($updated > 0) {
            broadcast(new PesanDibaca($conversation->id, $reader->id, $readAt->toIso8601String()))->toOthers();
        }

        return $updated;
    }

    /**
     * Total pesan belum dibaca dari lawan bicara di seluruh percakapan pengguna.
     */
    public function unreadTotal(User $user): int
    {
        return Message::query()
            ->unread()
            ->where('sender_id', '!=', $user->id)
            ->whereIn('conversation_id', $user->conversations()->select('id'))
            ->count();
    }

    /**
     * Satu notifikasi `pesan_baru` belum dibaca per percakapan: diperbarui, tidak ditumpuk.
     */
    private function notifyRecipient(User $recipient, User $sender, Message $message): void
    {
        $notification = new PesanBaruNotification($message, $sender);

        $existing = $recipient->unreadNotifications()
            ->where('type', PesanBaruNotification::class)
            ->get()
            ->first(fn ($item) => ($item->data['conversation_id'] ?? null) === $message->conversation_id);

        if ($existing) {
            $existing->forceFill([
                'data' => $notification->toArray($recipient),
                'created_at' => now(),
            ])->save();

            return;
        }

        $recipient->notify($notification);
    }
}
