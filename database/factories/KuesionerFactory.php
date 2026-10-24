<?php

namespace Database\Factories;

use App\Enums\KuesionerStatus;
use App\Models\Kuesioner;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Kuesioner>
 */
class KuesionerFactory extends Factory
{
    /**
     * Define the model's default state: kuesioner aktif dan sedang buka.
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
            'status' => KuesionerStatus::Active,
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => ['status' => KuesionerStatus::Draft]);
    }

    /**
     * State untuk kuesioner yang sudah ditutup.
     */
    public function closed(): static
    {
        return $this->state(fn (array $attributes) => ['status' => KuesionerStatus::Closed]);
    }

    /**
     * Alias lama untuk `closed()`.
     */
    public function inactive(): static
    {
        return $this->closed();
    }

    /**
     * Ditujukan untuk semua angkatan.
     */
    public function forAllGraduationYears(): static
    {
        return $this->state(fn (array $attributes) => ['target_graduation_years' => null]);
    }
}
