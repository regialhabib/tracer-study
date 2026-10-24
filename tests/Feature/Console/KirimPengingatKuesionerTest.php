<?php

namespace Tests\Feature\Console;

use App\Models\AlumniProfile;
use App\Models\Kuesioner;
use App\Models\ResponKuesioner;
use App\Models\User;
use App\Notifications\PengingatKuesionerNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class KirimPengingatKuesionerTest extends TestCase
{
    use RefreshDatabase;

    private function alumni(int $year = 2023): User
    {
        $user = User::factory()->alumni()->create();
        AlumniProfile::factory()->for($user, 'user')->create(['graduation_year' => $year]);

        return $user;
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function kuesionerBerakhirDalam(int $days, array $attributes = []): Kuesioner
    {
        return Kuesioner::factory()->create([
            'end_date' => now()->addDays($days)->toDateString(),
            'target_graduation_years' => [2023],
            ...$attributes,
        ]);
    }

    public function test_hanya_target_yang_belum_mengisi_menerima_pengingat_tepat_h_minus_7(): void
    {
        Notification::fake();
        $belum = $this->alumni();
        $draf = $this->alumni();
        $sudah = $this->alumni();
        $lainAngkatan = $this->alumni(2020);
        $kuesioner = $this->kuesionerBerakhirDalam(7);
        ResponKuesioner::factory()->for($kuesioner, 'kuesioner')->for($sudah, 'user')->submitted()->create();
        ResponKuesioner::factory()->for($kuesioner, 'kuesioner')->for($draf, 'user')->create();

        $this->artisan('kuesioner:kirim-pengingat')->assertSuccessful();

        Notification::assertSentTo([$belum, $draf], PengingatKuesionerNotification::class);
        Notification::assertNotSentTo([$sudah, $lainAngkatan], PengingatKuesionerNotification::class);
    }

    public function test_tidak_mengirim_pada_h_minus_6_atau_h_minus_8(): void
    {
        Notification::fake();
        $this->alumni();
        $this->kuesionerBerakhirDalam(6);
        $this->kuesionerBerakhirDalam(8, ['target_graduation_years' => [2024]]);

        $this->artisan('kuesioner:kirim-pengingat')->assertSuccessful();

        Notification::assertNothingSent();
    }

    public function test_kuesioner_tidak_aktif_dilewati(): void
    {
        Notification::fake();
        $this->alumni();
        $this->kuesionerBerakhirDalam(7, ['status' => 'closed']);

        $this->artisan('kuesioner:kirim-pengingat')->assertSuccessful();

        Notification::assertNothingSent();
    }

    public function test_dry_run_tidak_mengirim_namun_melaporkan_jumlah(): void
    {
        Notification::fake();
        $this->alumni();
        $this->alumni();
        $this->kuesionerBerakhirDalam(7);

        $this->artisan('kuesioner:kirim-pengingat', ['--dry-run' => true])
            ->expectsOutputToContain('2 penerima')
            ->assertSuccessful();

        Notification::assertNothingSent();
    }
}
