<?php

namespace App\Notifications;

use App\Models\Kuesioner;
use Illuminate\Notifications\Notification;

class KuesionerDibukaNotification extends Notification
{
    public function __construct(public Kuesioner $kuesioner) {}

    /**
     * Channel pengiriman: hanya database (notifikasi dalam aplikasi).
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array{kind: string, title: string, message: string, url: string}
     */
    public function toArray(object $notifiable): array
    {
        return [
            'kind' => 'kuesioner_dibuka',
            'title' => 'Kuesioner baru telah dibuka',
            'message' => "{$this->kuesioner->title} dapat diisi hingga {$this->kuesioner->end_date->translatedFormat('j F Y')}.",
            'url' => route('alumni.kuesioner.show', $this->kuesioner),
        ];
    }
}
