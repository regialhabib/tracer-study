<?php

namespace Database\Factories;

use App\Models\Kuesioner;
use App\Models\Pertanyaan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Pertanyaan>
 */
class PertanyaanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'kuesioner_id' => Kuesioner::factory(),
            'section' => 'Aktivitas Saat Ini',
            'question_text' => fake()->sentence(8).'?',
            'question_type' => 'radio',
            'options' => ['Pengabdian / Khidmah', 'Kuliah Studi Islam', 'Kuliah Umum', 'Bekerja', 'Wirausaha'],
            'metric_key' => 'status_alumni',
            'is_required' => true,
            'order' => 1,
            'conditional_rule' => null,
        ];
    }
}
