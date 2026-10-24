<?php

namespace App\Http\Resources;

use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Item daftar percakapan dari sudut pandang pengguna yang sedang login.
 * Muat `userOne.profile`, `userTwo.profile`, `latestMessage`, dan `unread_count` lebih dulu.
 *
 * @mixin Conversation
 */
class ConversationItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $viewer = $request->user();
        $last = $this->latestMessage;

        return [
            'id' => $this->id,
            'other' => (new KontakResource($this->otherParticipant($viewer)))->resolve($request),
            'last_message' => $last ? [
                'body' => $last->message,
                'sender_id' => $last->sender_id,
                'created_at' => $last->created_at?->toIso8601String(),
            ] : null,
            'unread_count' => (int) ($this->unread_count ?? 0),
            'last_message_at' => $this->last_message_at?->toIso8601String(),
        ];
    }
}
