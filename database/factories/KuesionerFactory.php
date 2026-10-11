<?php

namespace Database\Factories;

use App\Models\Kuesioner;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Kuesioner>
 */
class KuesionerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => 'Tracer Study Alumni MA Angkatan '.fake()->numberBetween(2022, 2024),
            'description' => fake()->paragraph(),
            'target_graduation_years' => [2022, 2023, 2024],
            'start_date' => now()->subDays(15)->toDateString(),
            'end_date' => now()->addDays(45)->toDateString(),
            'is_active' => true,
        ];
    }

    /**
     * State untuk kuesioner yang sudah ditutup/nonaktif.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
