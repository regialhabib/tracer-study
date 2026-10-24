<?php

namespace App\Enums;

/**
 * Status respon alumni terhadap satu kuesioner (PRD KSN-12–14).
 */
enum ResponStatus: string
{
    case Draft = 'draft';
    case Submitted = 'submitted';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draf',
            self::Submitted => 'Terkirim',
        };
    }
}
