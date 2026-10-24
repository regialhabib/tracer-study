<?php

namespace App\Services\Kuesioner;

use App\Enums\QuestionType;

/**
 * Konversi jawaban antara nilai bertipe (dipakai frontend & validasi) dan teks di
 * `jawaban_kuesioner.answer`.
 *
 * Bentuk nilai per tipe:
 * - text, textarea, radio, select: string (radio/select berisi `value` opsi)
 * - checkbox: list<string> (disimpan sebagai array JSON)
 * - rating: int 1–5
 * - number: int|float
 * - date: string `Y-m-d`
 */
class AnswerCodec
{
    /**
     * Ubah nilai menjadi teks untuk disimpan; null berarti "tidak dijawab" (baris jawaban dihapus).
     */
    public function encode(QuestionType $type, mixed $value): ?string
    {
        if ($this->isEmpty($value)) {
            return null;
        }

        return match ($type) {
            QuestionType::Checkbox => json_encode(array_values(array_unique(array_map('strval', (array) $value)))),
            QuestionType::Rating => (string) (int) $value,
            QuestionType::Number => $this->normalizeNumber($value),
            default => trim((string) $value),
        };
    }

    /**
     * Ubah teks tersimpan menjadi nilai bertipe.
     */
    public function decode(QuestionType $type, ?string $stored): mixed
    {
        if ($stored === null || $stored === '') {
            return $type->isMultiple() ? [] : null;
        }

        return match ($type) {
            QuestionType::Checkbox => array_values(array_map('strval', (array) (json_decode($stored, true) ?? []))),
            QuestionType::Rating => (int) $stored,
            QuestionType::Number => str_contains($stored, '.') ? (float) $stored : (int) $stored,
            default => $stored,
        };
    }

    public function isEmpty(mixed $value): bool
    {
        if (is_array($value)) {
            return array_filter($value, fn ($item) => $item !== null && $item !== '') === [];
        }

        return $value === null || (is_string($value) && trim($value) === '');
    }

    private function normalizeNumber(mixed $value): string
    {
        $number = is_string($value) ? str_replace(',', '.', trim($value)) : $value;

        return is_numeric($number) ? (string) ($number + 0) : (string) $value;
    }
}
