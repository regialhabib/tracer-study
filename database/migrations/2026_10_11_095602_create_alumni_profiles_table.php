<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('alumni_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('stambuk_number', 30)->nullable();
            $table->enum('gender', ['L', 'P']);
            $table->date('birth_date')->nullable();
            $table->string('birth_place', 100)->nullable();
            $table->string('phone_number', 25)->nullable();
            $table->year('entry_year');
            $table->year('graduation_year');
            $table->string('major', 100);
            $table->string('pesantren_program', 100)->nullable();
            $table->unsignedInteger('tahfidz_count')->default(0);
            $table->string('dormitory_complex', 100)->nullable();
            $table->string('current_status', 50)->default('pengabdian');
            $table->string('city', 100)->nullable();
            $table->string('province', 100)->nullable();
            $table->text('address')->nullable();
            $table->string('avatar_url', 255)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alumni_profiles');
    }
};
