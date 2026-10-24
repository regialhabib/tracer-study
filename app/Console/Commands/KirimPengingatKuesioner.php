<?php

namespace App\Console\Commands;

use App\Models\Kuesioner;
use App\Models\User;
use App\Notifications\PengingatKuesionerNotification;
use App\Services\Notifikasi\KuesionerAudienceService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('kuesioner:kirim-pengingat {--dry-run : Tampilkan jumlah penerima tanpa mengirim}')]
#[Description('Kirim pengingat H-7 kepada alumni yang belum mengisi kuesioner aktif')]
class KirimPengingatKuesioner extends Command
{
    private const HARI_SEBELUM_TENGGAT = 7;

    public function handle(KuesionerAudienceService $audience): int
    {
        $isDryRun = (bool) $this->option('dry-run');
        $tenggat = now()->addDays(self::HARI_SEBELUM_TENGGAT)->toDateString();

        $kuesionerList = Kuesioner::query()->active()->whereDate('end_date', $tenggat)->get();

        foreach ($kuesionerList as $kuesioner) {
            $recipients = $audience->belumMengisi($kuesioner);

            if ($isDryRun) {
                $this->info("[dry-run] {$kuesioner->title}: {$recipients->count()} penerima.");

                continue;
            }

            $sent = 0;
            $notification = new PengingatKuesionerNotification($kuesioner);

            $recipients->chunkById(200, function ($users) use ($notification, &$sent): void {
                $users->each(function (User $user) use ($notification, &$sent): void {
                    $user->notify($notification);
                    $sent++;
                });
            });

            $this->info("{$kuesioner->title}: pengingat terkirim ke {$sent} alumni.");
        }

        if ($kuesionerList->isEmpty()) {
            $this->info('Tidak ada kuesioner yang berakhir 7 hari lagi.');
        }

        return self::SUCCESS;
    }
}
