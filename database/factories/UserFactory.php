<?php

namespace Database\Factories;

use App\Enums\AccountStatus;
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
            'status' => AccountStatus::Active,
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
            'data_consent_at' => null,
        ]);
    }

    /**
     * Indicate that the user registered themselves and awaits admin verification.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => AccountStatus::Pending,
            'verified_at' => null,
            'verified_by' => null,
        ]);
    }

    /**
     * Indicate that the user has been deactivated (e.g. registration rejected by an admin).
     */
    public function inactive(?string $rejectionReason = null): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => AccountStatus::Inactive,
            'rejection_reason' => $rejectionReason,
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
