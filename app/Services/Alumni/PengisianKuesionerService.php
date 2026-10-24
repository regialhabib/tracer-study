<?php

namespace App\Services\Alumni;

use App\Enums\AlumniStatus;
use App\Enums\KuesionerStatus;
use App\Enums\MetricKey;
use App\Enums\QuestionType;
use App\Enums\ResponStatus;
use App\Models\JawabanKuesioner;
use App\Models\Kuesioner;
use App\Models\Pertanyaan;
use App\Models\ResponKuesioner;
use App\Models\User;
use App\Services\Admin\Analitik\AnalitikService;
use App\Services\Kuesioner\AnswerCodec;
use App\Services\Kuesioner\KuesionerAvailabilityService;
use App\Services\Kuesioner\KuesionerPresenter;
use App\Services\Kuesioner\VisibilityResolver;
use DateTime;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Logika pengisian kuesioner oleh alumni (KSN-10–15): respon draf, simpan jawaban per bagian,
 * validasi per tipe dengan logika kondisional, kirim, dan sinkron `current_status` profil.
 */
class PengisianKuesionerService
{
    private const TEXT_MAX = 255;

    private const TEXTAREA_MAX = 5000;

    private const NUMBER_MAX = 1000000;

    public function __construct(
        private KuesionerAvailabilityService $availability,
        private KuesionerPresenter $presenter,
        private VisibilityResolver $visibilityResolver,
        private AnswerCodec $codec,
        private AnalitikService $analitik,
    ) {}

    /**
     * Alasan alumni tidak boleh mengisi kuesioner ini; null bila boleh.
     */
    public function unavailableReason(User $user, Kuesioner $kuesioner): ?string
    {
        if ($this->availability->canFill($user, $kuesioner)) {
            return null;
        }

        if (! $kuesioner->targetsGraduationYear($user->profile?->graduation_year)) {
            return 'Kuesioner ini ditujukan untuk angkatan lain.';
        }

        return $kuesioner->status === KuesionerStatus::Closed || ! $kuesioner->isOpen()
            ? 'Kuesioner ini sudah ditutup atau belum dibuka.'
            : 'Kuesioner ini tidak tersedia untuk Anda.';
    }

    /**
     * Daftar kuesioner yang berlaku bagi alumni beserta status respon dan aksi yang tepat.
     *
     * @return list<array{id: int, title: string, description: ?string, end_date: string, pertanyaan_count: int, respon_status: ?string, action: string}>
     */
    public function listForAlumni(User $user): array
    {
        return $this->availability->forAlumni($user)
            ->map(function (Kuesioner $kuesioner): array {
                $status = $kuesioner->respon->first()?->status;

                return [
                    'id' => $kuesioner->id,
                    'title' => $kuesioner->title,
                    'description' => $kuesioner->description,
                    'end_date' => $kuesioner->end_date->toDateString(),
                    'pertanyaan_count' => (int) $kuesioner->pertanyaan_count,
                    'respon_status' => $status?->value,
                    'action' => match ($status) {
                        ResponStatus::Submitted => 'Revisi',
                        ResponStatus::Draft => 'Lanjutkan',
                        default => 'Mulai',
                    },
                ];
            })
            ->all();
    }

    /**
     * Respon alumni untuk kuesioner ini; dibuat berstatus draf saat pertama dibuka.
     */
    public function startOrResume(User $user, Kuesioner $kuesioner): ResponKuesioner
    {
        return ResponKuesioner::firstOrCreate(
            ['kuesioner_id' => $kuesioner->id, 'user_id' => $user->id],
            ['status' => ResponStatus::Draft],
        );
    }

    /**
     * @return Collection<int, Pertanyaan>
     */
    public function questions(Kuesioner $kuesioner): Collection
    {
        return $kuesioner->pertanyaan()->get();
    }

    /**
     * Data halaman Isi/Ringkasan.
     *
     * @return array{kuesioner: array<string, mixed>, sections: list<array<string, mixed>>, answers: array<int, mixed>, respon: array<string, mixed>}
     */
    public function pageData(Kuesioner $kuesioner, ResponKuesioner $respon): array
    {
        $questions = $this->questions($kuesioner);

        return [
            'kuesioner' => $this->presenter->kuesioner($kuesioner),
            'sections' => $this->presenter->sections($questions),
            'answers' => (object) $this->storedAnswers($respon, $questions),
            'respon' => [
                'status' => $respon->status->value,
                'submitted_at' => $respon->submitted_at?->toIso8601String(),
                'updated_at' => $respon->updated_at?->toIso8601String(),
            ],
        ];
    }

    /**
     * Indeks bagian yang sedang dikerjakan berdasarkan `current_section` (fallback 0).
     *
     * @param  list<array{name: string}>  $sections
     */
    public function sectionIndex(array $sections, ?string $name): int
    {
        foreach ($sections as $index => $section) {
            if ($section['name'] === $name) {
                return $index;
            }
        }

        return 0;
    }

    /**
     * Simpan jawaban sebagai draf. Idempoten; jawaban pertanyaan yang kini tersembunyi dihapus.
     *
     * @param  array<int|string, mixed>  $input  nilai bertipe dikunci id pertanyaan (null/kosong = hapus)
     *
     * @throws ValidationException
     */
    public function saveDraft(ResponKuesioner $respon, Kuesioner $kuesioner, string $section, array $input, bool $validate): ResponKuesioner
    {
        $questions = $this->questions($kuesioner);

        if (! $questions->contains(fn (Pertanyaan $question): bool => $question->sectionName() === $section)) {
            throw ValidationException::withMessages(['section' => 'Bagian kuesioner tidak dikenal.']);
        }

        $stored = $this->storedAnswers($respon, $questions);
        $incoming = [];

        foreach ($questions as $question) {
            if (! array_key_exists($question->id, $input)) {
                continue;
            }

            $value = $input[$question->id];

            if ($this->codec->isEmpty($value)) {
                $incoming[$question->id] = null;
            } elseif ($this->valueError($question, $value) === null) {
                $incoming[$question->id] = $value;
            }
        }

        $merged = $this->mergeAnswers($stored, $incoming);
        $visibility = $this->visibilityResolver->resolve($questions, $merged);

        if ($validate) {
            $errors = $this->errorsFor(
                $questions->filter(fn (Pertanyaan $question): bool => $question->sectionName() === $section),
                $merged,
                $visibility,
                $input,
            );

            if ($errors !== []) {
                throw ValidationException::withMessages(
                    collect($errors)->mapWithKeys(fn (string $message, int $id): array => ["answers.$id" => $message])->all()
                );
            }
        }

        DB::transaction(function () use ($respon, $kuesioner, $questions, $incoming, $visibility, $section): void {
            foreach ($questions as $question) {
                $isHidden = ! ($visibility[$question->id] ?? false);

                if (! $isHidden && ! array_key_exists($question->id, $incoming)) {
                    continue;
                }

                $encoded = $isHidden ? null : $this->codec->encode($question->question_type, $incoming[$question->id]);

                if ($encoded === null) {
                    $respon->jawaban()->where('pertanyaan_id', $question->id)->delete();

                    continue;
                }

                JawabanKuesioner::updateOrCreate(
                    ['respon_kuesioner_id' => $respon->id, 'pertanyaan_id' => $question->id],
                    ['kuesioner_id' => $kuesioner->id, 'user_id' => $respon->user_id, 'answer' => $encoded],
                );
            }

            $respon->forceFill(['current_section' => $section])->save();
            $respon->touch();
        });

        if ($respon->isSubmitted()) {
            $this->analitik->flushCache($kuesioner->id);
        }

        return $respon->refresh();
    }

    /**
     * Pertanyaan tampil yang belum valid, dikelompokkan per bagian (urut sesuai bagian).
     *
     * @return list<array{index: int, name: string, count: int}>
     */
    public function incompleteSections(Kuesioner $kuesioner, ResponKuesioner $respon): array
    {
        $questions = $this->questions($kuesioner);
        $answers = $this->storedAnswers($respon, $questions);
        $visibility = $this->visibilityResolver->resolve($questions, $answers);
        $errors = $this->errorsFor($questions, $answers, $visibility);

        $sections = [];

        foreach ($this->presenter->sections($questions) as $index => $section) {
            $count = collect($section['questions'])->filter(fn (array $question): bool => isset($errors[$question['id']]))->count();

            if ($count > 0) {
                $sections[] = ['index' => $index, 'name' => $section['name'], 'count' => $count];
            }
        }

        return $sections;
    }

    /**
     * Kirim jawaban: validasi seluruh bagian, tandai terkirim, lalu sinkronkan status kegiatan profil.
     *
     * @return list<array{index: int, name: string, count: int}> bagian bermasalah; kosong bila berhasil terkirim
     */
    public function submit(ResponKuesioner $respon, Kuesioner $kuesioner): array
    {
        $incomplete = $this->incompleteSections($kuesioner, $respon);

        if ($incomplete !== []) {
            return $incomplete;
        }

        DB::transaction(function () use ($respon, $kuesioner): void {
            $respon->forceFill([
                'status' => ResponStatus::Submitted,
                'submitted_at' => now(),
            ])->save();

            $this->syncCurrentStatus($respon, $kuesioner);
        });

        $this->analitik->flushCache($kuesioner->id);

        return [];
    }

    /**
     * Salin jawaban `status_kegiatan` ke `alumni_profiles.current_status`.
     */
    private function syncCurrentStatus(ResponKuesioner $respon, Kuesioner $kuesioner): void
    {
        $question = $this->questions($kuesioner)
            ->first(fn (Pertanyaan $question): bool => $question->metricKey() === MetricKey::StatusKegiatan);

        if ($question === null) {
            return;
        }

        $stored = $respon->jawaban()->where('pertanyaan_id', $question->id)->value('answer');
        $status = $stored === null ? null : AlumniStatus::tryFrom($stored);
        $profile = $respon->user()->first()?->profile;

        if ($status !== null && $profile !== null) {
            $profile->update(['current_status' => $status->value]);
        }
    }

    /**
     * @param  Collection<int, Pertanyaan>  $questions
     * @return array<int, mixed>
     */
    private function storedAnswers(ResponKuesioner $respon, Collection $questions): array
    {
        $rows = $respon->jawaban()->pluck('answer', 'pertanyaan_id');
        $answers = [];

        foreach ($questions as $question) {
            if ($rows->has($question->id)) {
                $answers[$question->id] = $this->codec->decode($question->question_type, $rows->get($question->id));
            }
        }

        return $answers;
    }

    /**
     * @param  array<int, mixed>  $stored
     * @param  array<int, mixed>  $incoming  null = hapus
     * @return array<int, mixed>
     */
    private function mergeAnswers(array $stored, array $incoming): array
    {
        $merged = $incoming + $stored;

        return array_filter($merged, fn ($value): bool => $value !== null);
    }

    /**
     * Kesalahan pertanyaan tampil: wajib diisi dan kesesuaian nilai dengan tipe.
     *
     * @param  Collection<int, Pertanyaan>  $questions
     * @param  array<int, mixed>  $answers
     * @param  array<int, bool>  $visibility
     * @param  array<int|string, mixed>|null  $rawInput  bila diberikan, nilai mentah dari request dipakai untuk menandai nilai tak sah
     * @return array<int, string> id pertanyaan → pesan
     */
    private function errorsFor(Collection $questions, array $answers, array $visibility, ?array $rawInput = null): array
    {
        $errors = [];

        foreach ($questions as $question) {
            if (! ($visibility[$question->id] ?? false)) {
                continue;
            }

            $value = $rawInput !== null && array_key_exists($question->id, $rawInput)
                ? $rawInput[$question->id]
                : ($answers[$question->id] ?? null);

            if ($this->codec->isEmpty($value)) {
                if ($question->is_required) {
                    $errors[$question->id] = 'Pertanyaan ini wajib diisi.';
                }

                continue;
            }

            $message = $this->valueError($question, $value);

            if ($message !== null) {
                $errors[$question->id] = $message;
            }
        }

        return $errors;
    }

    /**
     * Pesan kesalahan untuk nilai tidak kosong; null bila sesuai tipe pertanyaan.
     */
    private function valueError(Pertanyaan $question, mixed $value): ?string
    {
        $options = $question->optionValues();

        return match ($question->question_type) {
            QuestionType::Text => $this->stringError($value, self::TEXT_MAX),
            QuestionType::Textarea => $this->stringError($value, self::TEXTAREA_MAX),
            QuestionType::Radio, QuestionType::Select => is_string($value) && in_array($value, $options, true)
                ? null
                : 'Pilihan tidak valid.',
            QuestionType::Checkbox => is_array($value) && array_is_list($value) && collect($value)->every(fn ($item): bool => is_string($item) && in_array($item, $options, true))
                ? null
                : 'Pilihan tidak valid.',
            QuestionType::Rating => is_numeric($value) && (int) $value == $value && $value >= 1 && $value <= 5
                ? null
                : 'Pilih nilai antara 1 sampai 5.',
            QuestionType::Number => $this->numberError($value),
            QuestionType::Date => $this->dateError($value),
        };
    }

    private function stringError(mixed $value, int $max): ?string
    {
        if (! is_string($value)) {
            return 'Jawaban harus berupa teks.';
        }

        return mb_strlen($value) > $max ? "Jawaban maksimal $max karakter." : null;
    }

    private function numberError(mixed $value): ?string
    {
        $number = is_string($value) ? str_replace(',', '.', trim($value)) : $value;

        if (! is_numeric($number)) {
            return 'Jawaban harus berupa angka.';
        }

        return $number < 0 || $number > self::NUMBER_MAX
            ? 'Angka harus antara 0 dan 1.000.000.'
            : null;
    }

    private function dateError(mixed $value): ?string
    {
        $date = is_string($value) ? DateTime::createFromFormat('!Y-m-d', $value) : false;

        return $date !== false && $date->format('Y-m-d') === $value
            ? null
            : 'Tanggal tidak valid.';
    }
}
