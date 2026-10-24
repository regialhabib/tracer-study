<?php

namespace App\Models;

use Database\Factories\ConversationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Percakapan pribadi 1-ke-1. Pasangan disimpan terurut: `user_one_id` < `user_two_id`.
 */
#[Fillable([
    'user_one_id',
    'user_two_id',
    'last_message_at',
])]
class Conversation extends Model
{
    /** @use HasFactory<ConversationFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'last_message_at' => 'datetime',
        ];
    }

    /**
     * Peserta dengan id terkecil.
     */
    public function userOne(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_one_id');
    }

    /**
     * Peserta dengan id terbesar.
     */
    public function userTwo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_two_id');
    }

    /**
     * Seluruh riwayat pesan di ruang obrolan ini.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'conversation_id');
    }

    /**
     * Pesan terakhir dalam percakapan.
     */
    public function latestMessage(): HasOne
    {
        return $this->hasOne(Message::class, 'conversation_id')->latestOfMany();
    }

    /**
     * Percakapan yang diikuti pengguna.
     */
    #[Scope]
    protected function forUser(Builder $query, User|int $user): Builder
    {
        $userId = $user instanceof User ? $user->id : $user;

        return $query->where(fn (Builder $nested) => $nested
            ->where('user_one_id', $userId)
            ->orWhere('user_two_id', $userId));
    }

    /**
     * Percakapan antara dua pengguna tertentu (urutan argumen bebas).
     */
    #[Scope]
    protected function between(Builder $query, User|int $first, User|int $second): Builder
    {
        [$userOneId, $userTwoId] = self::orderedPair($first, $second);

        return $query->where('user_one_id', $userOneId)->where('user_two_id', $userTwoId);
    }

    /**
     * Pasangan id terurut untuk kolom `user_one_id` & `user_two_id`.
     *
     * @return array{0: int, 1: int}
     */
    public static function orderedPair(User|int $first, User|int $second): array
    {
        $firstId = $first instanceof User ? $first->id : $first;
        $secondId = $second instanceof User ? $second->id : $second;

        return [min($firstId, $secondId), max($firstId, $secondId)];
    }

    public function hasParticipant(User|int $user): bool
    {
        $userId = $user instanceof User ? $user->id : $user;

        return $this->user_one_id === $userId || $this->user_two_id === $userId;
    }

    /**
     * Lawan bicara dari sudut pandang `$user`.
     */
    public function otherParticipant(User $user): User
    {
        return $this->user_one_id === $user->id ? $this->userTwo : $this->userOne;
    }
}
