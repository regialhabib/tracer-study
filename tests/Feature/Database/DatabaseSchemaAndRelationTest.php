<?php

namespace Tests\Feature\Database;

use App\Enums\KuesionerStatus;
use App\Enums\QuestionType;
use App\Models\AlumniProfile;
use App\Models\Berita;
use App\Models\Conversation;
use App\Models\JawabanKuesioner;
use App\Models\Kuesioner;
use App\Models\Message;
use App\Models\Pertanyaan;
use App\Models\ResponKuesioner;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseSchemaAndRelationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_and_alumni_profile_relation_and_attributes(): void
    {
        $user = User::factory()->alumni()->create([
            'nisn' => '0059998888',
            'role' => 'alumni',
            'status' => 'active',
            'first_login' => true,
        ]);

        $profile = AlumniProfile::factory()->create([
            'user_id' => $user->id,
            'major' => 'Keagamaan (PK)',
            'tahfidz_count' => 30,
            'current_status' => 'pengabdian',
        ]);

        $this->assertTrue($user->isAlumni());
        $this->assertFalse($user->isAdmin());
        $this->assertTrue($user->first_login);
        $this->assertInstanceOf(AlumniProfile::class, $user->profile);
        $this->assertEquals('0059998888', $user->nisn);
        $this->assertEquals(30, $user->profile->tahfidz_count);
        $this->assertEquals('pengabdian', $user->profile->current_status);
        $this->assertEquals($user->id, $profile->user->id);
    }

    public function test_berita_relations_scopes_and_casts(): void
    {
        $admin = User::factory()->admin()->create();

        $publishedBerita = Berita::factory()->create([
            'author_id' => $admin->id,
            'type' => 'berita',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $agendaEvent = Berita::factory()->agenda()->create([
            'author_id' => $admin->id,
            'status' => 'published',
        ]);

        $draftBerita = Berita::factory()->draft()->create([
            'author_id' => $admin->id,
            'type' => 'berita',
        ]);

        $this->assertEquals(2, Berita::published()->count());
        $this->assertEquals(1, Berita::ofType('agenda')->count());
        $this->assertNotNull($agendaEvent->event_date);
        $this->assertEquals($admin->id, $publishedBerita->author->id);
        $this->assertCount(3, $admin->berita);
    }

    public function test_kuesioner_pertanyaan_and_jawaban_relations_and_json_casts(): void
    {
        $alumni = User::factory()->alumni()->create();

        $kuesioner = Kuesioner::factory()->create([
            'title' => 'Tracer Study 2024',
            'target_graduation_years' => [2023, 2024],
            'status' => KuesionerStatus::Active,
        ]);

        $this->assertIsArray($kuesioner->target_graduation_years);
        $this->assertContains(2024, $kuesioner->target_graduation_years);

        $pertanyaan = Pertanyaan::factory()->create([
            'kuesioner_id' => $kuesioner->id,
            'question_text' => 'Aktivitas utama santri saat ini?',
            'question_type' => 'radio',
            'options' => [
                ['value' => 'pengabdian', 'label' => 'Pengabdian'],
                ['value' => 'kuliah_umum', 'label' => 'Kuliah'],
            ],
            'metric_key' => 'status_kegiatan',
            'order' => 1,
        ]);

        $this->assertIsArray($pertanyaan->options);
        $this->assertEquals('Pengabdian', $pertanyaan->options[0]['label']);
        $this->assertSame(QuestionType::Radio, $pertanyaan->question_type);

        $respon = ResponKuesioner::factory()->create(['kuesioner_id' => $kuesioner->id, 'user_id' => $alumni->id]);
        $jawaban = JawabanKuesioner::factory()->forRespon($respon)->create([
            'pertanyaan_id' => $pertanyaan->id,
            'answer' => 'pengabdian',
        ]);

        $this->assertEquals($kuesioner->id, $jawaban->kuesioner->id);
        $this->assertEquals($alumni->id, $jawaban->user->id);
        $this->assertEquals($pertanyaan->id, $jawaban->pertanyaan->id);
        $this->assertEquals('pengabdian', $jawaban->answer);
        $this->assertEquals($respon->id, $jawaban->respon->id);
        $this->assertCount(1, $respon->jawaban);
        $this->assertCount(1, $kuesioner->pertanyaan);
        $this->assertCount(1, $pertanyaan->jawaban);
    }

    public function test_conversation_and_message_relations_and_cascade_delete(): void
    {
        $alumni = User::factory()->alumni()->create();
        $admin = User::factory()->admin()->create();

        $conversation = Conversation::factory()->create([
            'alumni_id' => $alumni->id,
            'admin_id' => $admin->id,
        ]);

        $message1 = Message::factory()->create([
            'conversation_id' => $conversation->id,
            'sender_id' => $alumni->id,
            'message' => 'Assalamu\'alaikum Ustadz',
            'is_read' => true,
            'read_at' => now(),
        ]);

        $message2 = Message::factory()->create([
            'conversation_id' => $conversation->id,
            'sender_id' => $admin->id,
            'message' => 'Wa\'alaikumsalam',
            'is_read' => false,
            'read_at' => null,
        ]);

        $this->assertCount(2, $conversation->messages);
        $this->assertEquals($alumni->id, $conversation->alumni->id);
        $this->assertEquals($admin->id, $conversation->admin->id);
        $this->assertEquals(1, Message::unread()->count());

        // Test cascade deletion: menghapus conversation harus menghapus seluruh messages
        $conversation->delete();
        $this->assertDatabaseMissing('messages', ['id' => $message1->id]);
        $this->assertDatabaseMissing('messages', ['id' => $message2->id]);
    }

    public function test_database_seeder_executes_cleanly(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertDatabaseHas('users', ['email' => 'admin@pesantren.sch.id', 'role' => 'admin']);
        $this->assertDatabaseHas('users', ['email' => 'fauzi@alumni.test', 'role' => 'alumni']);
        $this->assertDatabaseHas('alumni_profiles', ['major' => 'Keagamaan (PK)', 'current_status' => 'pengabdian']);
        $this->assertDatabaseHas('berita', ['type' => 'berita', 'status' => 'published']);
        $this->assertDatabaseCount('kuesioner', 2);
        $this->assertDatabaseHas('kuesioner', ['status' => 'active']);
        $this->assertDatabaseHas('kuesioner', ['status' => 'closed']);
        $this->assertDatabaseHas('pertanyaan', ['metric_key' => 'status_kegiatan', 'question_type' => 'radio']);
        $this->assertDatabaseHas('pertanyaan', ['metric_key' => 'kebutuhan_keterampilan', 'question_type' => 'checkbox']);
        $this->assertGreaterThanOrEqual(19, Pertanyaan::where('kuesioner_id', Kuesioner::where('status', 'active')->value('id'))->count());
        $this->assertDatabaseHas('respon_kuesioner', ['status' => 'submitted']);
        $this->assertDatabaseHas('respon_kuesioner', ['status' => 'draft']);
        $this->assertDatabaseHas('jawaban_kuesioner', ['answer' => 'pengabdian']);
        $this->assertDatabaseCount('conversations', 1);
        $this->assertDatabaseCount('messages', 3);
    }
}
