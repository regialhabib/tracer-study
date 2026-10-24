<?php

namespace Tests\Feature\Pesan;

use App\Events\PesanDibaca;
use App\Events\PesanMasuk;
use App\Events\PesanTerkirim;
use App\Models\AlumniProfile;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PercakapanTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    private function alumni(array $attributes = []): User
    {
        $user = User::factory()->alumni()->create($attributes);
        AlumniProfile::factory()->create(['user_id' => $user->id]);

        return $user;
    }

    /**
     * @return array<string, array{0: string, 1: string}>
     */
    public static function pasanganPeran(): array
    {
        return [
            'alumni ke alumni' => ['alumni', 'alumni'],
            'alumni ke admin' => ['alumni', 'admin'],
            'admin ke alumni' => ['admin', 'alumni'],
            'admin ke admin' => ['admin', 'admin'],
        ];
    }

    private function makeUser(string $role): User
    {
        return $role === 'admin' ? User::factory()->admin()->create() : $this->alumni();
    }

    #[DataProvider('pasanganPeran')]
    public function test_semua_kombinasi_peran_bisa_memulai_percakapan(string $starterRole, string $targetRole): void
    {
        $starter = $this->makeUser($starterRole);
        $target = $this->makeUser($targetRole);

        $response = $this->actingAs($starter)->post(route('pesan.start', $target));

        $conversation = Conversation::query()->between($starter, $target)->firstOrFail();
        $response->assertRedirect(route('pesan.show', $conversation));
    }

    public function test_memulai_dari_dua_arah_tidak_membuat_percakapan_ganda(): void
    {
        $a = $this->alumni();
        $b = $this->alumni();

        $this->actingAs($a)->post(route('pesan.start', $b));
        $this->actingAs($b)->post(route('pesan.start', $a));

        $this->assertDatabaseCount('conversations', 1);
    }

    public function test_memulai_ke_diri_sendiri_atau_akun_nonaktif_ditolak(): void
    {
        $a = $this->alumni();
        $inactive = User::factory()->alumni()->inactive()->create();
        $pending = User::factory()->alumni()->pending()->create();

        $this->actingAs($a)->post(route('pesan.start', $a))->assertSessionHas('error');
        $this->actingAs($a)->post(route('pesan.start', $inactive))->assertSessionHas('error');
        $this->actingAs($a)->post(route('pesan.start', $pending))->assertSessionHas('error');

        $this->assertDatabaseCount('conversations', 0);
    }

    public function test_bukan_peserta_mendapat_403_termasuk_admin(): void
    {
        $a = $this->alumni();
        $b = $this->alumni();
        $conversation = Conversation::factory()->between($a, $b)->create();

        foreach ([$this->alumni(), User::factory()->admin()->create()] as $outsider) {
            $this->actingAs($outsider)->get(route('pesan.show', $conversation))->assertForbidden();
            $this->actingAs($outsider)->getJson(route('pesan.history', $conversation))->assertForbidden();
            $this->actingAs($outsider)->postJson(route('pesan.store', $conversation), ['body' => 'Halo'])->assertForbidden();
            $this->actingAs($outsider)->postJson(route('pesan.read', $conversation))->assertForbidden();
        }

        $this->assertDatabaseCount('messages', 0);
    }

    public function test_mengirim_pesan_menyimpan_dan_menyiarkan_event(): void
    {
        Event::fake([PesanTerkirim::class, PesanMasuk::class, PesanDibaca::class]);
        $a = $this->alumni();
        $b = $this->alumni();
        $conversation = Conversation::factory()->between($a, $b)->create(['last_message_at' => null]);

        $response = $this->actingAs($a)->postJson(route('pesan.store', $conversation), ['body' => 'Assalamu\'alaikum']);

        $response->assertCreated()->assertJsonPath('message.body', 'Assalamu\'alaikum')
            ->assertJsonPath('message.sender_id', $a->id)
            ->assertJsonPath('message.is_read', false);
        $this->assertNotNull($conversation->fresh()->last_message_at);
        Event::assertDispatched(PesanTerkirim::class);
        Event::assertDispatched(PesanMasuk::class, fn (PesanMasuk $event) => $event->recipientId === $b->id && $event->unreadTotal === 1);
    }

    public function test_validasi_isi_pesan(): void
    {
        $a = $this->alumni();
        $conversation = Conversation::factory()->between($a, $this->alumni())->create();

        $this->actingAs($a)->postJson(route('pesan.store', $conversation), ['body' => '   '])->assertUnprocessable();
        $this->actingAs($a)->postJson(route('pesan.store', $conversation), ['body' => str_repeat('a', 2001)])->assertUnprocessable();
    }

    public function test_pesan_ke_pemblokir_atau_yang_diblokir_ditolak(): void
    {
        $a = $this->alumni();
        $b = $this->alumni();
        $conversation = Conversation::factory()->between($a, $b)->create();
        $b->blockedUsers()->attach($a->id);

        $this->actingAs($a)->postJson(route('pesan.store', $conversation), ['body' => 'Halo'])
            ->assertForbidden()->assertJsonStructure(['message']);
        $this->actingAs($b)->postJson(route('pesan.store', $conversation), ['body' => 'Halo'])->assertForbidden();
        $this->assertDatabaseCount('messages', 0);
    }

    public function test_pengaturan_privasi_alumni_berlaku_untuk_alumni_tetapi_tidak_untuk_admin(): void
    {
        $closed = $this->alumni();
        $closed->profile->update(['allow_alumni_messages' => false]);
        $otherAlumni = $this->alumni();
        $admin = User::factory()->admin()->create();

        $this->actingAs($otherAlumni)->post(route('pesan.start', $closed))->assertSessionHas('error');

        $conversationAdmin = Conversation::factory()->between($admin, $closed)->create();
        $this->actingAs($admin)->postJson(route('pesan.store', $conversationAdmin), ['body' => 'Halo'])->assertCreated();
    }

    public function test_akun_tidak_aktif_tidak_bisa_dikirimi_pesan(): void
    {
        $a = $this->alumni();
        $inactive = User::factory()->alumni()->inactive()->create();
        $conversation = Conversation::factory()->between($a, $inactive)->create();

        $this->actingAs($a)->postJson(route('pesan.store', $conversation), ['body' => 'Halo'])->assertForbidden();
    }

    public function test_notifikasi_pesan_baru_tidak_menumpuk_per_percakapan(): void
    {
        $a = $this->alumni();
        $b = $this->alumni();
        $conversation = Conversation::factory()->between($a, $b)->create();

        $this->actingAs($a)->postJson(route('pesan.store', $conversation), ['body' => 'Pertama']);
        $this->actingAs($a)->postJson(route('pesan.store', $conversation), ['body' => 'Kedua']);

        $notifications = $b->unreadNotifications()->get();
        $this->assertCount(1, $notifications);
        $this->assertSame('pesan_baru', $notifications[0]->data['kind']);
        $this->assertSame("Pesan baru dari {$a->name}", $notifications[0]->data['title']);
        $this->assertSame('Kedua', $notifications[0]->data['message']);
        $this->assertSame(route('pesan.show', $conversation), $notifications[0]->data['url']);
    }

    public function test_membuka_percakapan_menandai_dibaca_dan_menyiarkan(): void
    {
        $a = $this->alumni();
        $b = $this->alumni();
        $conversation = Conversation::factory()->between($a, $b)->create();
        Message::factory()->count(2)->create(['conversation_id' => $conversation->id, 'sender_id' => $b->id]);
        $own = Message::factory()->create(['conversation_id' => $conversation->id, 'sender_id' => $a->id]);
        Event::fake([PesanDibaca::class]);

        $this->actingAs($a)->get(route('pesan.show', $conversation))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Pesan/Show')
                ->where('conversation.id', $conversation->id)
                ->where('other.id', $b->id)
                ->has('messages.data', 3)
                ->where('messages.has_more', false)
                ->where('canReply', true)
                ->where('replyBlockedReason', null)
                ->where('isBlockedByMe', false)
                ->where('canBlock', true)
                ->has('conversations', 1)
                ->where('conversations.0.unread_count', 0));

        $this->assertSame(0, Message::unread()->where('sender_id', $b->id)->count());
        $this->assertFalse($own->fresh()->is_read);
        Event::assertDispatched(PesanDibaca::class, fn (PesanDibaca $event) => $event->readerId === $a->id);
    }

    public function test_endpoint_baca_mengembalikan_total_belum_dibaca_akurat(): void
    {
        $a = $this->alumni();
        $b = $this->alumni();
        $c = $this->alumni();
        $first = Conversation::factory()->between($a, $b)->create();
        $second = Conversation::factory()->between($a, $c)->create();
        Message::factory()->count(2)->create(['conversation_id' => $first->id, 'sender_id' => $b->id]);
        Message::factory()->count(3)->create(['conversation_id' => $second->id, 'sender_id' => $c->id]);

        $this->actingAs($a)->postJson(route('pesan.read', $first))->assertOk()->assertExactJson(['unread_total' => 3]);
    }

    public function test_index_menampilkan_percakapan_urut_dan_pencarian_nama(): void
    {
        $me = $this->alumni();
        $budi = $this->alumni(['name' => 'Budi Santoso']);
        $siti = $this->alumni(['name' => 'Siti Aminah']);
        $empty = $this->alumni(['name' => 'Tanpa Pesan']);
        $old = Conversation::factory()->between($me, $budi)->create(['last_message_at' => now()->subDay()]);
        $new = Conversation::factory()->between($me, $siti)->create(['last_message_at' => now()]);
        $none = Conversation::factory()->between($me, $empty)->create(['last_message_at' => null]);
        Message::factory()->create(['conversation_id' => $new->id, 'sender_id' => $siti->id, 'message' => 'Halo kamu']);

        $this->actingAs($me)->get(route('pesan.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Pesan/Index')
                ->where('conversations.0.id', $new->id)
                ->where('conversations.1.id', $old->id)
                ->where('conversations.2.id', $none->id)
                ->where('conversations.0.unread_count', 1)
                ->where('conversations.0.last_message.body', 'Halo kamu')
                ->where('conversations.2.last_message', null)
                ->where('conversations.0.other.id', $siti->id)
                ->where('filters.q', ''));

        $this->actingAs($me)->get(route('pesan.index', ['q' => 'budi']))
            ->assertInertia(fn (Assert $page) => $page
                ->has('conversations', 1)
                ->where('conversations.0.id', $old->id)
                ->where('filters.q', 'budi'));
    }

    public function test_riwayat_dipaginasi_dengan_before(): void
    {
        $a = $this->alumni();
        $conversation = Conversation::factory()->between($a, $this->alumni())->create();
        $messages = Message::factory()->count(35)->create(['conversation_id' => $conversation->id, 'sender_id' => $a->id]);

        $this->actingAs($a)->get(route('pesan.show', $conversation))
            ->assertInertia(fn (Assert $page) => $page
                ->has('messages.data', 30)
                ->where('messages.data.0.id', $messages[5]->id)
                ->where('messages.has_more', true));

        $this->actingAs($a)->getJson(route('pesan.history', ['conversation' => $conversation, 'before' => $messages[5]->id]))
            ->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('data.0.id', $messages[0]->id)
            ->assertJsonPath('has_more', false);
    }

    public function test_show_memuat_alasan_saat_diblokir(): void
    {
        $a = $this->alumni();
        $b = $this->alumni();
        $conversation = Conversation::factory()->between($a, $b)->create();
        $b->blockedUsers()->attach($a->id);

        $this->actingAs($a)->get(route('pesan.show', $conversation))
            ->assertInertia(fn (Assert $page) => $page
                ->where('canReply', false)
                ->where('replyBlockedReason', 'Anda tidak dapat membalas percakapan ini.')
                ->where('isBlockedByMe', false));

        $a->blockedUsers()->attach($b->id);
        $this->actingAs($a)->get(route('pesan.show', $conversation))
            ->assertInertia(fn (Assert $page) => $page->where('isBlockedByMe', true)->where('canReply', false));
    }

    public function test_pesan_ke_31_terkena_batas_laju(): void
    {
        $a = $this->alumni();
        $conversation = Conversation::factory()->between($a, $this->alumni())->create();

        for ($i = 0; $i < 30; $i++) {
            $this->actingAs($a)->postJson(route('pesan.store', $conversation), ['body' => "Pesan {$i}"])->assertCreated();
        }

        $this->actingAs($a)->postJson(route('pesan.store', $conversation), ['body' => 'Terlalu banyak'])
            ->assertStatus(429)->assertJsonStructure(['message']);
    }
}
