<?php

namespace App\Enums;

/**
 * Status kegiatan alumni saat ini (`alumni_profiles.current_status`).
 */
enum AlumniStatus: string
{
    case Pengabdian = 'pengabdian';
    case KuliahIslam = 'kuliah_islam';
    case KuliahUmum = 'kuliah_umum';
    case Bekerja = 'bekerja';
    case Wirausaha = 'wirausaha';
    case MencariKerja = 'mencari_kerja';
    case Lainnya = 'lainnya';

    /**
     * Label status kegiatan dalam Bahasa Indonesia.
     */
    public function label(): string
    {
        return match ($this) {
            self::Pengabdian => 'Pengabdian/Khidmah',
            self::KuliahIslam => 'Kuliah Keislaman',
            self::KuliahUmum => 'Kuliah Umum',
            self::Bekerja => 'Bekerja',
            self::Wirausaha => 'Wirausaha',
            self::MencariKerja => 'Mencari Kerja',
            self::Lainnya => 'Lainnya',
        };
    }
}
