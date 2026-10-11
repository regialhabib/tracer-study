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
        Schema::create('pertanyaan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kuesioner_id')->constrained('kuesioner')->cascadeOnDelete();
            $table->string('section', 100)->nullable();
            $table->text('question_text');
            $table->string('question_type', 30);
            $table->json('options')->nullable();
            $table->string('metric_key', 50)->nullable();
            $table->boolean('is_required')->default(true);
            $table->integer('order')->default(0);
            $table->json('conditional_rule')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pertanyaan');
    }
};
