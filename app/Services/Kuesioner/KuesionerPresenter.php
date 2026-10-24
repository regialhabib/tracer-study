<?php

namespace App\Services\Kuesioner;

use App\Models\Kuesioner;
use App\Models\Pertanyaan;
use Illuminate\Support\Collection;

/**
 * Bentuk data kuesioner & pertanyaan untuk props Inertia. Satu sumber untuk pratinjau admin
 * dan pengisian alumni, agar `QuestionRenderer` menerima bentuk yang sama (PRD KSN-06).
 */
class KuesionerPresenter
{
    /**
     * @return array{id: int, title: string, description: ?string, start_date: string, end_date: string, status: string, target_graduation_years: list<int>}
     */
    public function kuesioner(Kuesioner $kuesioner): array
    {
        return [
            'id' => $kuesioner->id,
            'title' => $kuesioner->title,
            'description' => $kuesioner->description,
            'start_date' => $kuesioner->start_date->toDateString(),
            'end_date' => $kuesioner->end_date->toDateString(),
            'status' => $kuesioner->status->value,
            'target_graduation_years' => array_values(array_map('intval', $kuesioner->target_graduation_years ?? [])),
        ];
    }

    /**
     * @return array{id: int, section: string, question_text: string, help_text: ?string, question_type: string, options: list<array{value: string, label: string}>, metric_key: ?string, is_required: bool, order: int, conditional_rule: ?array<string, mixed>}
     */
    public function question(Pertanyaan $question): array
    {
        return [
            'id' => $question->id,
            'section' => $question->sectionName(),
            'question_text' => $question->question_text,
            'help_text' => $question->help_text,
            'question_type' => $question->question_type->value,
            'options' => array_values($question->options ?? []),
            'metric_key' => $question->metric_key,
            'is_required' => $question->is_required,
            'order' => $question->order,
            'conditional_rule' => $question->conditional_rule,
        ];
    }

    /**
     * Kelompokkan pertanyaan per bagian, urut sesuai kemunculan pertama.
     *
     * @param  Collection<int, Pertanyaan>  $questions  urut sesuai `order`
     * @return list<array{name: string, questions: list<array<string, mixed>>}>
     */
    public function sections(Collection $questions): array
    {
        $sections = [];

        foreach ($questions as $question) {
            $name = $question->sectionName();
            $sections[$name] ??= ['name' => $name, 'questions' => []];
            $sections[$name]['questions'][] = $this->question($question);
        }

        return array_values($sections);
    }
}
