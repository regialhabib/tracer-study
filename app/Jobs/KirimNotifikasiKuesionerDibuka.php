<?php

namespace App\Jobs;

use App\Models\Kuesioner;
use App\Models\User;
use App\Notifications\KuesionerDibukaNotification;
use App\Services\Notifikasi\KuesionerAudienceService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

/**
 * Mengirim notifikasi "kuesioner dibuka" ke seluruh alumni sasaran secara bertahap.
 */
class KirimNotifikasiKuesionerDibuka implements ShouldQueue
{
    use Queueable;

    public function __construct(public Kuesioner $kuesioner) {}

    public function handle(KuesionerAudienceService $audience): void
    {
        $notification = new KuesionerDibukaNotification($this->kuesioner);

        $audience->targets($this->kuesioner)->chunkById(200, function ($users) use ($notification): void {
            $users->each(fn (User $user) => $user->notify($notification));
        });
    }
}
