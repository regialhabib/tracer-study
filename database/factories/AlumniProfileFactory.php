<?php

namespace Database\Factories;

use App\Models\AlumniProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AlumniProfile>
 */
class AlumniProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $gender = fake()->randomElement(['L', 'P']);
        $majors = ['Keagamaan (PK)', 'MIPA', 'IPS', 'Bahasa'];
        $programs = ['Tahfidz Al-Qur\'an', 'Kitab Kuning / Salaf', 'Reguler Diniyah'];
        $complexes = ['Kompleks Al-Ghazali', 'Kompleks Ibnu Rusyd', 'Kompleks Khadijah', 'Kompleks Aisyah'];
        $statuses = ['pengabdian', 'kuliah_islam', 'kuliah_umum', 'bekerja', 'wirausaha', 'mencari_kerja'];

        return [
            'user_id' => User::factory(),
            'stambuk_number' => 'STB-'.fake()->unique()->numerify('####'),
            'gender' => $gender,
            'birth_date' => fake()->dateTimeBetween('-24 years', '-18 years')->format('Y-m-d'),
            'birth_place' => fake()->city(),
            'phone_number' => fake()->phoneNumber(),
            'entry_year' => 2021,
            'graduation_year' => 2024,
            'major' => fake()->randomElement($majors),
            'pesantren_program' => fake()->randomElement($programs),
            'tahfidz_count' => fake()->numberBetween(2, 30),
            'dormitory_complex' => fake()->randomElement($complexes),
            'current_status' => fake()->randomElement($statuses),
            'city' => fake()->city(),
            'province' => fake()->state(),
            'address' => fake()->address(),
            'avatar_url' => null,
        ];
    }

    /**
     * State untuk santri yang sedang berstatus pengabdian/khidmah.
     */
    public function pengabdian(): static
    {
        return $this->state(fn (array $attributes) => [
            'current_status' => 'pengabdian',
        ]);
    }

    /**
     * State untuk santri yang sedang kuliah studi Islam / Timur Tengah.
     */
    public function kuliahIslam(): static
    {
        return $this->state(fn (array $attributes) => [
            'current_status' => 'kuliah_islam',
        ]);
    }
}
