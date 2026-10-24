<?php

namespace App\Services\Kuesioner;

use App\Models\Pertanyaan;
use Illuminate\Support\Collection;

/**
 * Menentukan pertanyaan mana yang tampil berdasarkan `conditional_rule` (PRD KSN-04).
 *
 * Aturan (sama persis dengan `resources/js/lib/kuesioner.js` → `resolveVisibility`):
 * - Tanpa aturan → tampil.
 * - Pertanyaan acuan tersembunyi atau tidak ada → ikut tersembunyi.
 * - `equals`: jawaban acuan sama dengan `value` (untuk checkbox: `value` termasuk yang dicentang).
 * - `in`: jawaban acuan termasuk salah satu `value` (untuk checkbox: ada irisan).
 */
class VisibilityResolver
{
    /**
     * @param  Collection<int, Pertanyaan>  $questions  urut sesuai `order`
     * @param  array<int, mixed>  $answers  nilai bertipe (lihat AnswerCodec), dikunci id pertanyaan
     * @return array<int, bool> id pertanyaan → tampil?
     */
    public function resolve(Collection $questions, array $answers): array
    {
        $visibility = [];

        foreach ($questions as $question) {
            $visibility[$question->id] = $this->isVisible($question->conditional_rule, $answers, $visibility);
        }

        return $visibility;
    }

    /**
     * @param  array{depends_on?: int, operator?: string, value?: string|list<string>}|null  $rule
     * @param  array<int, mixed>  $answers
     * @param  array<int, bool>  $visibility  hasil pertanyaan sebelumnya
     */
    private function isVisible(?array $rule, array $answers, array $visibility): bool
    {
        if ($rule === null || ! isset($rule['depends_on'])) {
            return true;
        }

        $dependsOn = (int) $rule['depends_on'];

        if (! ($visibility[$dependsOn] ?? false)) {
            return false;
        }

        $answer = $answers[$dependsOn] ?? null;

        if ($answer === null || $answer === '' || $answer === []) {
            return false;
        }

        $expected = array_map('strval', (array) ($rule['value'] ?? []));
        $given = array_map('strval', (array) $answer);

        return ($rule['operator'] ?? 'equals') === 'in'
            ? array_intersect($given, $expected) !== []
            : in_array($expected[0] ?? null, $given, true);
    }
}
