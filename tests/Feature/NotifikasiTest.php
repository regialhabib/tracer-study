<?php

namespace Tests\Feature;

use App\Enums\KuesionerStatus;
use App\Jobs\KirimNotifikasiKuesionerDibuka;
use App\Models\AlumniProfile;
use App\Models\Kuesioner;
use App\Models\Pertanyaan;
use App\Models\User;
use App\Notifications\AkunDiverifikasiNotification;
use App\Notifications\KuesionerDibukaNotification;
use App\Services\Notifikasi\KuesionerAudienceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Queue;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class NotifikasiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    private function alumniDenganAngkatan(int $year, string $state = 'alumni'): User
    {
        $user = User::factory()->{$state}()->create();
        AlumniProfile::factory()->for($user, 'user')->create(['graduation_year' => $year]);

        return $user;
    }

    public function test_halaman_daftar_memuat_notifikasi_milik_sendiri(): void
    {
        $user = User::factory()->alumni()->create();
        $user->notify(new AkunDiverifikasiNotification);

        $this->actingAs($user)->get(route('notifikasi.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Notifikasi/Index')
                ->has('notifications.data', 1)
                ->where('notifications.data.0.kind', 'akun_diverifikasi')
                ->has('notifications.data.0.url'));
    }

    public function test_recent_mengembalikan_maksimal_delapan_item_dan_jumlah_belum_dibaca(): void
    {
        $user = User::factory()->alumni()->create();
        foreach (range(1, 10) as $ignored) {
            $user->notify(new AkunDiverifikasiNotification);
        }
        $user->unreadNotifications()->first()->markAsRead();

        $this->actingAs($user)->getJson(route('notifikasi.recent'))
            ->assertOk()
            ->assertJsonCount(8, 'items')
            ->assertJsonPath('unread', 9);
    }

    public function test_tandai_satu_menandai_terbaca_dan_mengarahkan_ke_url(): void
    {
        $user = User::factory()->alumni()->create();
        $user->notify(new AkunDiverifikasiNotification);
        $notification = $user->notifications()->first();

        $this->actingAs($user)->post(route('notifikasi.read', $notification->id))
            ->assertRedirect(route('dashboard'));

        $this->assertNotNull($notification->refresh()->read_at);
        $this->assertSame(0, $user->unreadNotifications()->count());
    }

    public function test_tandai_satu_dengan_back_kembali_ke_halaman_sebelumnya(): void
    {
        $user = User::factory()->alumni()->create();
        $user->notify(new AkunDiverifikasiNotification);
        $notification = $user->notifications()->first();

        $this->actingAs($user)->from(route('notifikasi.index'))
            ->post(route('notifikasi.read', ['notification' => $notification->id, 'back' => 1]))
            ->assertRedirect(route('notifikasi.index'));
    }

    public function test_tandai_semua_terbaca_hanya_milik_sendiri(): void
    {
        $user = User::factory()->alumni()->create();
        $other = User::factory()->alumni()->create();
        $user->notify(new AkunDiverifikasiNotification);
        $user->notify(new AkunDiverifikasiNotification);
        $other->notify(new AkunDiverifikasiNotification);

        $this->actingAs($user)->post(route('notifikasi.read-all'))->assertRedirect();

        $this->assertSame(0, $user->unreadNotifications()->count());
        $this->assertSame(1, $other->unreadNotifications()->count());
    }

    public function test_notifikasi_milik_orang_lain_mengembalikan_404(): void
    {
        $owner = User::factory()->alumni()->create();
        $intruder = User::factory()->alumni()->create();
        $owner->notify(new AkunDiverifikasiNotification);
        $notification = $owner->notifications()->first();

        $this->actingAs($intruder)->post(route('notifikasi.read', $notification->id))->assertNotFound();

        $this->assertNull($notification->refresh()->read_at);
    }

    public function test_tamu_diarahkan_ke_login(): void
    {
        $this->get(route('notifikasi.index'))->assertRedirect(route('login'));
    }

    public function test_shared_prop_unread_akurat(): void
    {
        $user = User::factory()->alumni()->create();
        $user->notify(new AkunDiverifikasiNotification);

        $this->actingAs($user)->get(route('notifikasi.index'))
            ->assertInertia(fn (Assert $page) => $page->where('notifikasi.unread', 1));
    }

    public function test_mengaktifkan_kuesioner_men_dispatch_job_notifikasi(): void
    {
        Queue::fake();
        $admin = User::factory()->admin()->create();
        $kuesioner = Kuesioner::factory()->draft()->create();
        Pertanyaan::factory()->for($kuesioner, 'kuesioner')->create();

        $this->actingAs($admin)->patch(route('admin.kuesioner.status', $kuesioner), ['status' => 'active']);

        Queue::assertPushed(KirimNotifikasiKuesionerDibuka::class, fn ($job) => $job->kuesioner->is($kuesioner));
    }

    public function test_menutup_kuesioner_tidak_men_dispatch_job(): void
    {
        Queue::fake();
        $admin = User::factory()->admin()->create();
        $kuesioner = Kuesioner::factory()->create();

        $this->actingAs($admin)->patch(route('admin.kuesioner.status', $kuesioner), ['status' => 'closed']);

        $this->assertSame(KuesionerStatus::Closed, $kuesioner->refresh()->status);
        Queue::assertNothingPushed();
    }

    public function test_job_hanya_mengirim_ke_alumni_aktif_pada_angkatan_target(): void
    {
        Notification::fake();
        $cocok = $this->alumniDenganAngkatan(2023);
        $beda = $this->alumniDenganAngkatan(2020);
        $nonaktif = $this->alumniDenganAngkatan(2023, 'inactive');
        $admin = User::factory()->admin()->create();
        $kuesioner = Kuesioner::factory()->create(['target_graduation_years' => [2023]]);

        (new KirimNotifikasiKuesionerDibuka($kuesioner))->handle(app(KuesionerAudienceService::class));

        Notification::assertSentTo($cocok, KuesionerDibukaNotification::class);
        Notification::assertNotSentTo([$beda, $nonaktif, $admin], KuesionerDibukaNotification::class);
    }

    public function test_job_dengan_target_kosong_mengirim_ke_semua_angkatan(): void
    {
        Notification::fake();
        $a = $this->alumniDenganAngkatan(2019);
        $b = $this->alumniDenganAngkatan(2024);
        $kuesioner = Kuesioner::factory()->forAllGraduationYears()->create();

        (new KirimNotifikasiKuesionerDibuka($kuesioner))->handle(app(KuesionerAudienceService::class));

        Notification::assertSentTo([$a, $b], KuesionerDibukaNotification::class);
    }
}
