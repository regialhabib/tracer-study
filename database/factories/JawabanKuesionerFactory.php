<?php

namespace Database\Factories;

use App\Models\JawabanKuesioner;
use App\Models\Kuesioner;
use App\Models\Pertanyaan;
use App\Models\ResponKuesioner;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JawabanKuesioner>
 */
class JawabanKuesionerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'respon_kuesioner_id' => null,
            'kuesioner_id' => Kuesioner::factory(),
            'user_id' => User::factory(),
            'pertanyaan_id' => Pertanyaan::factory(),
            'answer' => fake()->sentence(3),
        ];
    }

    /**
     * Jawaban milik sebuah respon (kuesioner & user mengikuti respon).
     */
    public function forRespon(ResponKuesioner $respon): static
    {
        return $this->state(fn (array $attributes) => [
            'respon_kuesioner_id' => $respon->id,
            'kuesioner_id' => $respon->kuesioner_id,
            'user_id' => $respon->user_id,
        ]);
    }
}
