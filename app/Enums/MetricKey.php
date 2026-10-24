<?php

namespace App\Enums;

/**
 * `metric_key` baku yang dibaca analitik (PRD §8.3). Builder menampilkannya sebagai dropdown.
 */
enum MetricKey: string
{
    case StatusKegiatan = 'status_kegiatan';
    case MasaTungguBulan = 'masa_tunggu_bulan';
    case RentangPendapatan = 'rentang_pendapatan';
    case NamaLembaga = 'nama_lembaga';
    case RelevansiIlmu = 'relevansi_ilmu';
    case KebutuhanKeterampilan = 'kebutuhan_keterampilan';

    public function label(): string
    {
        return match ($this) {
            self::StatusKegiatan => 'Status kegiatan',
            self::MasaTungguBulan => 'Masa tunggu (bulan)',
            self::RentangPendapatan => 'Rentang pendapatan',
            self::NamaLembaga => 'Nama kampus/tempat kerja',
            self::RelevansiIlmu => 'Relevansi ilmu',
            self::KebutuhanKeterampilan => 'Kebutuhan keterampilan',
        };
    }

    /**
     * Tipe pertanyaan yang wajib dipakai bersama metric_key ini.
     */
    public function questionType(): QuestionType
    {
        return match ($this) {
            self::StatusKegiatan, self::RentangPendapatan => QuestionType::Radio,
            self::MasaTungguBulan => QuestionType::Number,
            self::NamaLembaga => QuestionType::Text,
            self::RelevansiIlmu => QuestionType::Rating,
            self::KebutuhanKeterampilan => QuestionType::Checkbox,
        };
    }

    /**
     * Opsi baku. Nilai (`value`) dikunci agar analitik konsisten antar-periode;
     * admin hanya boleh mengubah label. Null = opsi bebas disusun admin.
     *
     * @return list<array{value: string, label: string}>|null
     */
    public function presetOptions(): ?array
    {
        return match ($this) {
            self::StatusKegiatan => array_map(
                fn (AlumniStatus $status): array => ['value' => $status->value, 'label' => $status->label()],
                AlumniStatus::cases(),
            ),
            self::RentangPendapatan => [
                ['value' => 'lt_1jt', 'label' => '< Rp1 jt'],
                ['value' => '1_3jt', 'label' => 'Rp1–3 jt'],
                ['value' => '3_5jt', 'label' => 'Rp3–5 jt'],
                ['value' => 'gt_5jt', 'label' => '> Rp5 jt'],
            ],
            default => null,
        };
    }
}
