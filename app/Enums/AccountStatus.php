<?php

namespace App\Enums;

/**
 * Status akun pengguna (`users.status`).
 */
enum AccountStatus: string
{
    case Active = 'active';
    case Pending = 'pending';
    case Inactive = 'inactive';

    /**
     * Label status akun dalam Bahasa Indonesia.
     */
    public function label(): string
    {
        return match ($this) {
            self::Active => 'Aktif',
            self::Pending => 'Menunggu Verifikasi',
            self::Inactive => 'Nonaktif',
        };
    }
}
