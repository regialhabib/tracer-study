<?php

namespace App\Services\Admin\Analitik;

use App\Enums\QuestionType;
use App\Enums\ResponStatus;
use App\Models\Pertanyaan;
use App\Models\ResponKuesioner;
use App\Services\Kuesioner\AnswerCodec;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;

class JawabanExportService
{
    public function __construct(private AnswerCodec $codec) {}

    public function filename(AnalitikFilter $filter): string
    {
        return 'jawaban-'.Str::slug($filter->kuesioner?->title ?? 'kuesioner').'-'.now()->format('Ymd').'.xlsx';
    }

    /**
     * Menulis satu baris per respon terkirim (sesuai filter) ke output, streaming.
     */
    public function stream(AnalitikFilter $filter): void
    {
        $kuesioner = $filter->kuesioner;
        $pertanyaan = $kuesioner->pertanyaan()->get();

        $writer = new Writer;
        $writer->openToFile('php://output');
        $writer->addRow(Row::fromValues([
            'NISN', 'Nama', 'L/P', 'Angkatan', 'Peminatan', 'Dikirim pada',
            ...$pertanyaan->pluck('question_text')->all(),
        ]));

        $this->query($filter)->lazyById(200)->each(function (ResponKuesioner $respon) use ($writer, $pertanyaan, $kuesioner) {
            $profile = $respon->user?->profile;

            if (! $kuesioner->targetsGraduationYear($profile?->graduation_year)) {
                return;
            }

            $answers = $respon->jawaban->pluck('answer', 'pertanyaan_id');

            $writer->addRow(Row::fromValues([
                (string) $respon->user?->nisn,
                (string) $respon->user?->name,
                $profile?->gender ?? '',
                $profile?->graduation_year ?? '',
                $profile?->major ?? '',
                $respon->submitted_at?->format('Y-m-d H:i') ?? '',
                ...$pertanyaan->map(fn (Pertanyaan $item) => $this->cellValue($item, $answers->get($item->id)))->all(),
            ]));
        });

        $writer->close();
    }

    /**
     * @return Builder<ResponKuesioner>
     */
    private function query(AnalitikFilter $filter): Builder
    {
        return ResponKuesioner::query()
            ->where('kuesioner_id', $filter->kuesioner->id)
            ->where('status', ResponStatus::Submitted->value)
            ->whereHas('user', function (Builder $user) use ($filter) {
                $user->withTrashed()->where('role', 'alumni')->whereHas('profile', function (Builder $profile) use ($filter) {
                    $profile
                        ->when($filter->angkatan !== [], fn (Builder $q) => $q->whereIn('graduation_year', $filter->angkatan))
                        ->when($filter->gender !== null, fn (Builder $q) => $q->where('gender', $filter->gender))
                        ->when($filter->major !== null, fn (Builder $q) => $q->where('major', $filter->major));
                });
            })
            ->with(['user' => fn ($user) => $user->withTrashed(), 'user.profile', 'jawaban']);
    }

    private function cellValue(Pertanyaan $pertanyaan, ?string $stored): string|int|float
    {
        if ($stored === null || $stored === '') {
            return '';
        }

        $value = $this->codec->decode($pertanyaan->question_type, $stored);

        return match ($pertanyaan->question_type) {
            QuestionType::Checkbox => implode('; ', array_map(fn (string $item) => $pertanyaan->optionLabel($item), $value)),
            QuestionType::Radio, QuestionType::Select => $pertanyaan->optionLabel((string) $value),
            QuestionType::Rating, QuestionType::Number => $value,
            default => (string) $value,
        };
    }
}
