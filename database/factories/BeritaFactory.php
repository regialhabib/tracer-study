<?php

namespace Database\Factories;

use App\Models\Berita;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Berita>
 */
class BeritaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->sentence(6);

        return [
            'author_id' => User::factory()->admin(),
            'type' => fake()->randomElement(['berita', 'agenda', 'pengumuman', 'info_beasiswa']),
            'title' => $title,
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(100, 9999),
            'thumbnail' => null,
            'content' => collect(fake()->paragraphs(3))->map(fn (string $paragraph) => '<p>'.$paragraph.'</p>')->implode(''),
            'event_date' => null,
            'location' => null,
            'registration_link' => null,
            'status' => 'published',
            'published_at' => now(),
        ];
    }

    /**
     * State untuk agenda kegiatan / event santri.
     */
    public function agenda(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'agenda',
            'event_date' => fake()->dateTimeBetween('+1 week', '+2 months'),
            'location' => fake()->randomElement(['Aula Utama Pesantren', 'Masjid Jami\' Pondok', 'Zoom Meeting']),
            'registration_link' => fake()->url(),
        ]);
    }

    /**
     * State untuk draft.
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
            'published_at' => null,
        ]);
    }

    /**
     * State untuk konten terbit yang dijadwalkan di masa depan.
     */
    public function scheduled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'published',
            'published_at' => now()->addDays(3),
        ]);
    }
}
