<?php

namespace App\Notifications;

use App\Models\Message;
use App\Models\User;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

class PesanBaruNotification extends Notification
{
    public function __construct(public Message $message, public User $sender) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array{kind: string, title: string, message: string, url: string, conversation_id: int}
     */
    public function toArray(object $notifiable): array
    {
        return [
            'kind' => 'pesan_baru',
            'title' => "Pesan baru dari {$this->sender->name}",
            'message' => Str::limit($this->message->message, 80),
            'url' => route('pesan.show', $this->message->conversation_id),
            'conversation_id' => $this->message->conversation_id,
        ];
    }
}
