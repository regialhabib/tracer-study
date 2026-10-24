<?php

namespace Database\Factories;

use App\Enums\ResponStatus;
use App\Models\Kuesioner;
use App\Models\ResponKuesioner;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ResponKuesioner>
 */
class ResponKuesionerFactory extends Factory
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
            'user_id' => User::factory(),
            'status' => ResponStatus::Draft,
            'current_section' => null,
            'submitted_at' => null,
        ];
    }

    /**
     * Respon yang sudah dikirim.
     */
    public function submitted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ResponStatus::Submitted,
            'submitted_at' => now(),
        ]);
    }
}
