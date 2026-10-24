<?php

namespace Tests\Feature\Services\Kuesioner;

use App\Enums\QuestionType;
use App\Models\Kuesioner;
use App\Models\Pertanyaan;
use App\Services\Kuesioner\AnswerCodec;
use App\Services\Kuesioner\VisibilityResolver;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KuesionerFoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_answer_codec_round_trips_typed_values(): void
    {
        $codec = new AnswerCodec;

        $this->assertSame('["a","b"]', $codec->encode(QuestionType::Checkbox, ['a', 'b', 'a']));
        $this->assertSame(['a', 'b'], $codec->decode(QuestionType::Checkbox, '["a","b"]'));
        $this->assertSame(4, $codec->decode(QuestionType::Rating, $codec->encode(QuestionType::Rating, '4')));
        $this->assertSame(2.5, $codec->decode(QuestionType::Number, $codec->encode(QuestionType::Number, '2,5')));
        $this->assertNull($codec->encode(QuestionType::Text, '   '));
        $this->assertNull($codec->encode(QuestionType::Checkbox, []));
        $this->assertSame([], $codec->decode(QuestionType::Checkbox, null));
    }

    public function test_visibility_follows_rules_and_hides_chained_dependents(): void
    {
        $kuesioner = Kuesioner::factory()->create();
        $status = Pertanyaan::factory()->for($kuesioner)->create(['order' => 1]);
        $kampus = Pertanyaan::factory()->for($kuesioner)->type(QuestionType::Checkbox)
            ->dependsOn($status, ['opsi_a', 'opsi_b'], 'in')->create(['order' => 2]);
        $detail = Pertanyaan::factory()->for($kuesioner)->type(QuestionType::Text)
            ->dependsOn($kampus, 'opsi_c')->create(['order' => 3]);

        $questions = $kuesioner->pertanyaan()->get();
        $resolver = new VisibilityResolver;

        $this->assertSame(
            [$status->id => true, $kampus->id => true, $detail->id => true],
            $resolver->resolve($questions, [$status->id => 'opsi_b', $kampus->id => ['opsi_a', 'opsi_c']]),
        );

        $this->assertSame(
            [$status->id => true, $kampus->id => false, $detail->id => false],
            $resolver->resolve($questions, [$status->id => 'opsi_c', $kampus->id => ['opsi_c']]),
        );
    }

    public function test_kuesioner_open_scope_and_target_years(): void
    {
        $open = Kuesioner::factory()->create(['target_graduation_years' => [2023]]);
        Kuesioner::factory()->draft()->create();
        Kuesioner::factory()->create(['start_date' => now()->addDay(), 'end_date' => now()->addDays(10)]);

        $this->assertSame([$open->id], Kuesioner::open()->pluck('id')->all());
        $this->assertTrue($open->isOpen());
        $this->assertTrue($open->targetsGraduationYear(2023));
        $this->assertFalse($open->targetsGraduationYear(2020));
        $this->assertTrue(Kuesioner::factory()->forAllGraduationYears()->make()->targetsGraduationYear(null));
    }
}
