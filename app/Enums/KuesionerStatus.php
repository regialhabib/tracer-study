<?php

namespace App\Enums;

/**
 * Siklus hidup kuesioner (PRD KSN-08): draf → aktif → ditutup.
 */
enum KuesionerStatus: string
{
    case Draft = 'draft';
    case Active = 'active';
    case Closed = 'closed';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draf',
            self::Active => 'Aktif',
            self::Closed => 'Ditutup',
        };
    }

    /**
     * Transisi status yang diizinkan dari status ini.
     *
     * @return list<self>
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Draft => [self::Active],
            self::Active => [self::Closed],
            self::Closed => [self::Active],
        };
    }
}
