<?php

namespace App\Events;

use App\Http\Resources\KontakResource;
use App\Http\Resources\MessageResource;
use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class PesanMasuk implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public Message $message,
        public int $recipientId,
        public int $unreadTotal,
    ) {}

    /**
     * @return array<int, PrivateChannel>
     */
    public function broadcastOn(): array
    {
        return [new PrivateChannel('App.Models.User.'.$this->recipientId)];
    }

    public function broadcastAs(): string
    {
        return 'pesan.masuk';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        $this->message->loadMissing('sender.profile');

        return [
            'conversation_id' => $this->message->conversation_id,
            'unread_total' => $this->unreadTotal,
            'message' => (new MessageResource($this->message))->resolve(),
            'sender' => (new KontakResource($this->message->sender))->resolve(),
        ];
    }
}
