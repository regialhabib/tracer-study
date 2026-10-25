<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Foto profil dipindah dari alumni_profiles.avatar_url ke users.avatar_path
 * agar semua peran (termasuk admin) dapat memiliki foto profil.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar_path')->nullable()->after('name');
        });

        DB::table('alumni_profiles')
            ->whereNotNull('avatar_url')
            ->select(['id', 'user_id', 'avatar_url'])
            ->chunkById(500, function ($profiles): void {
                foreach ($profiles as $profile) {
                    DB::table('users')->where('id', $profile->user_id)->update(['avatar_path' => $profile->avatar_url]);
                }
            });

        Schema::table('alumni_profiles', function (Blueprint $table) {
            $table->dropColumn('avatar_url');
        });
    }

    /**
     * Reverse the migrations. Foto profil milik admin hilang karena admin tidak memiliki profil alumni.
     */
    public function down(): void
    {
        Schema::table('alumni_profiles', function (Blueprint $table) {
            $table->string('avatar_url')->nullable()->after('address');
        });

        DB::table('users')
            ->whereNotNull('avatar_path')
            ->select(['id', 'avatar_path'])
            ->chunkById(500, function ($users): void {
                foreach ($users as $user) {
                    DB::table('alumni_profiles')->where('user_id', $user->id)->update(['avatar_url' => $user->avatar_path]);
                }
            });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('avatar_path');
        });
    }
};
