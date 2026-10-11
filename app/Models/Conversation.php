<?php

namespace App\Models;

use Database\Factories\ConversationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'alumni_id',
    'admin_id',
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
     * Pengguna alumni dalam percakapan.
     */
    public function alumni(): BelongsTo
    {
        return $this->belongsTo(User::class, 'alumni_id');
    }

    /**
     * Pengguna admin/ustadz dalam percakapan.
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
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
}
