<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Seeder;

class ConversationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();
        $alumni = User::where('email', 'fauzi@alumni.test')->first();

        if (! $admin || ! $alumni) {
            return;
        }

        $conversation = Conversation::create([
            'alumni_id' => $alumni->id,
            'admin_id' => $admin->id,
            'last_message_at' => now(),
        ]);

        Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $alumni->id,
            'message' => 'Assalamu\'alaikum Ustadz, mohon izin bertanya mengenai surat rekomendasi untuk kelanjutan masa khidmah di cabang Kediri.',
            'attachment_path' => null,
            'is_read' => true,
            'read_at' => now()->subMinutes(15),
            'created_at' => now()->subMinutes(20),
        ]);

        Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $admin->id,
            'message' => 'Wa\'alaikumsalam warahmatullah, ahlan wa sahlan Akhi Fauzi. Tentu bisa, berkasnya sedang kami proses di bagian sekretariat pondok ya.',
            'attachment_path' => null,
            'is_read' => true,
            'read_at' => now()->subMinutes(5),
            'created_at' => now()->subMinutes(10),
        ]);

        Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $alumni->id,
            'message' => 'Alhamdulillah, matur nuwun sanget Ustadz. Semoga Allah membalas kebaikan antum.',
            'attachment_path' => null,
            'is_read' => false,
            'read_at' => null,
            'created_at' => now()->subMinutes(2),
        ]);
    }
}
