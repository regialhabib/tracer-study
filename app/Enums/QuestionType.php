<?php

namespace App\Enums;

/**
 * Delapan tipe pertanyaan kuesioner (PRD KSN-02).
 */
enum QuestionType: string
{
    case Text = 'text';
    case Textarea = 'textarea';
    case Radio = 'radio';
    case Checkbox = 'checkbox';
    case Select = 'select';
    case Rating = 'rating';
    case Number = 'number';
    case Date = 'date';

    public function label(): string
    {
        return match ($this) {
            self::Text => 'Teks singkat',
            self::Textarea => 'Paragraf',
            self::Radio => 'Pilihan tunggal',
            self::Checkbox => 'Pilihan ganda',
            self::Select => 'Dropdown',
            self::Rating => 'Skala 1–5',
            self::Number => 'Angka',
            self::Date => 'Tanggal',
        };
    }

    /**
     * Tipe yang memakai daftar opsi `[{value, label}]`.
     */
    public function hasOptions(): bool
    {
        return in_array($this, [self::Radio, self::Checkbox, self::Select], true);
    }

    /**
     * Tipe yang jawabannya berupa banyak nilai (disimpan sebagai array JSON).
     */
    public function isMultiple(): bool
    {
        return $this === self::Checkbox;
    }
}
