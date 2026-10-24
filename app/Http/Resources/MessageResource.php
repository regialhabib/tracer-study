<?php

namespace App\Http\Resources;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Bentuk pesan sesuai kontrak Fase 5; `body` berasal dari kolom `message`.
 *
 * @mixin Message
 */
class MessageResource extends JsonResource
{
    /**
     * @return array{id: int, conversation_id: int, sender_id: int, body: string, is_read: bool, read_at: ?string, created_at: ?string}
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'conversation_id' => $this->conversation_id,
            'sender_id' => $this->sender_id,
            'body' => $this->message,
            'is_read' => (bool) $this->is_read,
            'read_at' => $this->read_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
