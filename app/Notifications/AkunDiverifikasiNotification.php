<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class AkunDiverifikasiNotification extends Notification
{
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
     * Isi notifikasi yang disimpan di tabel `notifications`.
     *
     * @return array{title: string, message: string, url: string}
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Akun Anda telah diverifikasi',
            'message' => 'Admin madrasah telah menyetujui pendaftaran Anda. Silakan lengkapi data dan isi kuesioner.',
            'url' => route('dashboard'),
        ];
    }
}
