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
        Schema::create('jawaban_kuesioner', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kuesioner_id')->constrained('kuesioner')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('pertanyaan_id')->constrained('pertanyaan')->cascadeOnDelete();
            $table->text('answer');
            $table->timestamps();

            $table->index(['kuesioner_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jawaban_kuesioner');
    }
};
