<?php

namespace App\Enums;

/**
 * Status terbit konten. Konten `published` dengan `published_at` di masa depan = terjadwal.
 */
enum BeritaStatus: string
{
    case Draft = 'draft';
    case Published = 'published';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draf',
            self::Published => 'Terbit',
        };
    }
}
