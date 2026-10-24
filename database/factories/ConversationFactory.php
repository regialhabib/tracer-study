<?php

namespace Database\Factories;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Conversation>
 */
class ConversationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_one_id' => User::factory()->alumni(),
            'user_two_id' => User::factory()->admin(),
            'last_message_at' => now(),
        ];
    }

    /**
     * Percakapan antara dua pengguna tertentu (disimpan sebagai pasangan id terurut).
     */
    public function between(User $first, User $second): static
    {
        [$userOneId, $userTwoId] = Conversation::orderedPair($first, $second);

        return $this->state(fn (array $attributes) => [
            'user_one_id' => $userOneId,
            'user_two_id' => $userTwoId,
        ]);
    }
}
