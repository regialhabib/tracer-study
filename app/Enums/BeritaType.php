<?php

namespace App\Enums;

/**
 * Tipe konten kanal informasi (PRD BRT-01).
 */
enum BeritaType: string
{
    case Berita = 'berita';
    case Agenda = 'agenda';
    case Pengumuman = 'pengumuman';
    case InfoBeasiswa = 'info_beasiswa';

    public function label(): string
    {
        return match ($this) {
            self::Berita => 'Berita',
            self::Agenda => 'Agenda',
            self::Pengumuman => 'Pengumuman',
            self::InfoBeasiswa => 'Info Beasiswa',
        };
    }

    /**
     * Agenda wajib punya tanggal & jam, lokasi, dan tautan pendaftaran (PRD BRT-02).
     */
    public function requiresEventFields(): bool
    {
        return $this === self::Agenda;
    }
}
