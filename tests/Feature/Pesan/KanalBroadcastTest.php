<?php

namespace Tests\Feature\Pesan;

use App\Events\PesanDibaca;
use App\Events\PesanMasuk;
use App\Events\PesanTerkirim;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use ReflectionMethod;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Tests\TestCase;

class KanalBroadcastTest extends TestCase
{
    use RefreshDatabase;

    private function canJoin(User $user, string $channel): bool
    {
        $request = Request::create('/broadcasting/auth', 'POST');
        $request->setUserResolver(fn () => $user);

        $broadcaster = Broadcast::driver();
        $method = new ReflectionMethod($broadcaster, 'verifyUserCanAccessChannel');

        try {
            $method->invoke($broadcaster, $request, $channel);

            return true;
        } catch (AccessDeniedHttpException) {
            return false;
        }
    }

    public function test_kanal_percakapan_hanya_untuk_dua_peserta(): void
    {
        $a = User::factory()->alumni()->create();
        $b = User::factory()->alumni()->create();
        $admin = User::factory()->admin()->create();
        $conversation = Conversation::factory()->between($a, $b)->create();

        $this->assertTrue($this->canJoin($a, "percakapan.{$conversation->id}"));
        $this->assertTrue($this->canJoin($b, "percakapan.{$conversation->id}"));
        $this->assertFalse($this->canJoin($admin, "percakapan.{$conversation->id}"));
        $this->assertFalse($this->canJoin(User::factory()->alumni()->create(), "percakapan.{$conversation->id}"));
    }

    public function test_kanal_pribadi_pengguna_hanya_untuk_pemilik(): void
    {
        $a = User::factory()->alumni()->create();
        $b = User::factory()->alumni()->create();

        $this->assertTrue($this->canJoin($a, "App.Models.User.{$a->id}"));
        $this->assertFalse($this->canJoin($a, "App.Models.User.{$b->id}"));
    }

    public function test_event_memakai_kanal_nama_dan_payload_sesuai_kontrak(): void
    {
        $a = User::factory()->alumni()->create();
        $b = User::factory()->alumni()->create();
        $conversation = Conversation::factory()->between($a, $b)->create();
        $message = Message::factory()->create(['conversation_id' => $conversation->id, 'sender_id' => $a->id, 'message' => 'Halo']);

        $terkirim = new PesanTerkirim($message);
        $this->assertEquals([new PrivateChannel("percakapan.{$conversation->id}")], $terkirim->broadcastOn());
        $this->assertSame('pesan.terkirim', $terkirim->broadcastAs());
        $this->assertSame('Halo', $terkirim->broadcastWith()['message']['body']);

        $dibaca = new PesanDibaca($conversation->id, $b->id, now()->toIso8601String());
        $this->assertSame('pesan.dibaca', $dibaca->broadcastAs());
        $this->assertSame(['conversation_id', 'reader_id', 'read_at'], array_keys($dibaca->broadcastWith()));

        $masuk = new PesanMasuk($message, $b->id, 4);
        $this->assertEquals([new PrivateChannel("App.Models.User.{$b->id}")], $masuk->broadcastOn());
        $this->assertSame('pesan.masuk', $masuk->broadcastAs());
        $payload = $masuk->broadcastWith();
        $this->assertSame(4, $payload['unread_total']);
        $this->assertSame($a->id, $payload['sender']['id']);
        $this->assertArrayNotHasKey('email', $payload['sender']);
    }
}
