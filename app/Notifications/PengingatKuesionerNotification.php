<?php

namespace App\Notifications;

use App\Models\Kuesioner;
use Illuminate\Notifications\Notification;

class PengingatKuesionerNotification extends Notification
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
            'kind' => 'pengingat_kuesioner',
            'title' => 'Kuesioner segera berakhir',
            'message' => "{$this->kuesioner->title} akan ditutup pada {$this->kuesioner->end_date->translatedFormat('j F Y')}. Mohon segera lengkapi jawaban Anda.",
            'url' => route('alumni.kuesioner.show', $this->kuesioner),
        ];
    }
}
