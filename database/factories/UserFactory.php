<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'nisn' => (string) fake()->unique()->numerify('00########'),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'role' => 'alumni',
            'status' => 'active',
            'first_login' => false,
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the user is an admin.
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'admin',
            'nisn' => null,
            'first_login' => false,
        ]);
    }

    /**
     * Indicate that the user is an alumni.
     */
    public function alumni(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'alumni',
        ]);
    }

    /**
     * Indicate that the user has not logged in yet (first login).
     */
    public function firstLogin(): static
    {
        return $this->state(fn (array $attributes) => [
            'first_login' => true,
        ]);
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
