<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Menambah `respon_kuesioner_id` dan menormalkan data lama:
     * - setiap pasangan (kuesioner, user) yang sudah punya jawaban dibuatkan respon `submitted`;
     * - opsi pertanyaan berupa daftar teks diubah menjadi `[{value, label}]`, dan jawaban pilihan
     *   yang menyimpan label diganti dengan `value`-nya.
     */
    public function up(): void
    {
        Schema::table('jawaban_kuesioner', function (Blueprint $table) {
            $table->foreignId('respon_kuesioner_id')->nullable()->after('id')
                ->constrained('respon_kuesioner')->cascadeOnDelete();
            $table->unique(['respon_kuesioner_id', 'pertanyaan_id']);
        });

        $pairs = DB::table('jawaban_kuesioner')
            ->select('kuesioner_id', 'user_id', DB::raw('MAX(updated_at) as last_answered_at'))
            ->groupBy('kuesioner_id', 'user_id')
            ->get();

        foreach ($pairs as $pair) {
            $responId = DB::table('respon_kuesioner')->insertGetId([
                'kuesioner_id' => $pair->kuesioner_id,
                'user_id' => $pair->user_id,
                'status' => 'submitted',
                'submitted_at' => $pair->last_answered_at ?? now(),
                'created_at' => $pair->last_answered_at ?? now(),
                'updated_at' => $pair->last_answered_at ?? now(),
            ]);

            DB::table('jawaban_kuesioner')
                ->where('kuesioner_id', $pair->kuesioner_id)
                ->where('user_id', $pair->user_id)
                ->update(['respon_kuesioner_id' => $responId]);
        }

        $this->normalizeLegacyOptions();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jawaban_kuesioner', function (Blueprint $table) {
            $table->dropUnique(['respon_kuesioner_id', 'pertanyaan_id']);
            $table->dropConstrainedForeignId('respon_kuesioner_id');
        });
    }

    private function normalizeLegacyOptions(): void
    {
        $questions = DB::table('pertanyaan')
            ->whereIn('question_type', ['radio', 'checkbox', 'select'])
            ->whereNotNull('options')
            ->get(['id', 'question_type', 'options']);

        foreach ($questions as $question) {
            $options = json_decode($question->options, true);

            if (! is_array($options) || $options === [] || is_array($options[0] ?? null)) {
                continue;
            }

            $labelToValue = [];
            $normalized = [];

            foreach ($options as $index => $label) {
                $value = Str::slug((string) $label, '_') ?: 'opsi_'.($index + 1);

                while (in_array($value, $labelToValue, true)) {
                    $value .= '_'.($index + 1);
                }

                $labelToValue[(string) $label] = $value;
                $normalized[] = ['value' => $value, 'label' => (string) $label];
            }

            DB::table('pertanyaan')->where('id', $question->id)->update(['options' => json_encode($normalized)]);

            $answers = DB::table('jawaban_kuesioner')->where('pertanyaan_id', $question->id)->get(['id', 'answer']);

            foreach ($answers as $answer) {
                $converted = $question->question_type === 'checkbox'
                    ? json_encode(array_values(array_map(
                        fn ($label) => $labelToValue[$label] ?? $label,
                        (array) (json_decode($answer->answer, true) ?? []),
                    )))
                    : ($labelToValue[$answer->answer] ?? $answer->answer);

                DB::table('jawaban_kuesioner')->where('id', $answer->id)->update(['answer' => $converted]);
            }
        }

        DB::table('pertanyaan')->where('question_type', 'rating')->update(['options' => null]);
    }
};
