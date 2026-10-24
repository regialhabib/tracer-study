<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Percakapan 1-ke-1 antarpengguna mana pun (PRD MSG-01): `alumni_id`/`admin_id`
     * diganti pasangan terurut `user_one_id` (id terkecil) dan `user_two_id`.
     */
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->foreignId('user_one_id')->nullable()->after('id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('user_two_id')->nullable()->after('user_one_id')->constrained('users')->cascadeOnDelete();
        });

        DB::table('conversations')->orderBy('id')->each(function (object $conversation): void {
            DB::table('conversations')->where('id', $conversation->id)->update([
                'user_one_id' => min($conversation->alumni_id, $conversation->admin_id),
                'user_two_id' => max($conversation->alumni_id, $conversation->admin_id),
            ]);
        });

        // MySQL memakai index unique sebagai index FK, jadi FK dilepas lebih dulu.
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropForeign(['alumni_id']);
            $table->dropForeign(['admin_id']);
        });

        Schema::table('conversations', function (Blueprint $table) {
            $table->dropUnique(['alumni_id', 'admin_id']);
            $table->dropColumn(['alumni_id', 'admin_id']);
        });

        Schema::table('conversations', function (Blueprint $table) {
            $table->unsignedBigInteger('user_one_id')->nullable(false)->change();
            $table->unsignedBigInteger('user_two_id')->nullable(false)->change();
            $table->unique(['user_one_id', 'user_two_id']);
            $table->index(['user_two_id', 'last_message_at']);
        });
    }

    /**
     * Kembali ke struktur alumni–admin. Percakapan yang tidak berisi tepat satu admin dibuang.
     */
    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->foreignId('alumni_id')->nullable()->after('id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('admin_id')->nullable()->after('alumni_id')->constrained('users')->cascadeOnDelete();
        });

        $roles = DB::table('users')->pluck('role', 'id');

        DB::table('conversations')->orderBy('id')->each(function (object $conversation) use ($roles): void {
            $pair = [$conversation->user_one_id, $conversation->user_two_id];
            $admins = array_values(array_filter($pair, fn (int $id) => ($roles[$id] ?? null) === 'admin'));

            if (count($admins) !== 1) {
                DB::table('conversations')->where('id', $conversation->id)->delete();

                return;
            }

            DB::table('conversations')->where('id', $conversation->id)->update([
                'admin_id' => $admins[0],
                'alumni_id' => $pair[0] === $admins[0] ? $pair[1] : $pair[0],
            ]);
        });

        Schema::table('conversations', function (Blueprint $table) {
            $table->dropIndex(['user_two_id', 'last_message_at']);
            $table->dropUnique(['user_one_id', 'user_two_id']);
            $table->dropConstrainedForeignId('user_one_id');
            $table->dropConstrainedForeignId('user_two_id');
            $table->unique(['alumni_id', 'admin_id']);
        });
    }
};
