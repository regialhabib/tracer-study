<?php

namespace Database\Factories;

use App\Enums\MetricKey;
use App\Enums\QuestionType;
use App\Models\Kuesioner;
use App\Models\Pertanyaan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Pertanyaan>
 */
class PertanyaanFactory extends Factory
{
    /**
     * Define the model's default state: pilihan tunggal wajib dengan tiga opsi.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'kuesioner_id' => Kuesioner::factory(),
            'section' => 'Aktivitas Saat Ini',
            'question_text' => fake()->sentence(8).'?',
            'help_text' => null,
            'question_type' => QuestionType::Radio,
            'options' => [
                ['value' => 'opsi_a', 'label' => 'Opsi A'],
                ['value' => 'opsi_b', 'label' => 'Opsi B'],
                ['value' => 'opsi_c', 'label' => 'Opsi C'],
            ],
            'metric_key' => null,
            'is_required' => true,
            'order' => 1,
            'conditional_rule' => null,
        ];
    }

    /**
     * Pertanyaan dengan tipe tertentu; opsi hanya diisi untuk tipe berpilihan.
     */
    public function type(QuestionType $type): static
    {
        return $this->state(fn (array $attributes) => [
            'question_type' => $type,
            'options' => $type->hasOptions() ? $attributes['options'] : null,
        ]);
    }

    public function optional(): static
    {
        return $this->state(fn (array $attributes) => ['is_required' => false]);
    }

    /**
     * Pertanyaan baku untuk metric_key tertentu (tipe & opsi preset mengikuti enum).
     */
    public function metric(MetricKey $metricKey): static
    {
        return $this->state(fn (array $attributes) => [
            'metric_key' => $metricKey->value,
            'question_type' => $metricKey->questionType(),
            'options' => $metricKey->presetOptions()
                ?? ($metricKey->questionType()->hasOptions() ? $attributes['options'] : null),
        ]);
    }

    /**
     * Tampil hanya bila jawaban pertanyaan acuan sesuai.
     *
     * @param  string|list<string>  $value
     */
    public function dependsOn(Pertanyaan $question, string|array $value, string $operator = 'equals'): static
    {
        return $this->state(fn (array $attributes) => [
            'conditional_rule' => ['depends_on' => $question->id, 'operator' => $operator, 'value' => $value],
        ]);
    }
}
