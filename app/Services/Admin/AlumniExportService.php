<?php

namespace App\Services\Admin;

use App\Enums\AccountStatus;
use App\Enums\AlumniStatus;
use App\Models\User;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;

class AlumniExportService
{
    public function __construct(private AlumniService $alumniService) {}

    /**
     * Nama berkas unduhan, mis. alumni-20261024.xlsx.
     */
    public function filename(): string
    {
        return 'alumni-'.now()->format('Ymd').'.xlsx';
    }

    /**
     * Menulis berkas .xlsx ke output (streaming) sesuai filter yang sama dengan halaman index.
     *
     * @param  array<string, mixed>  $filters
     */
    public function stream(array $filters): void
    {
        $writer = new Writer;
        $writer->openToFile('php://output');

        $writer->addRow(Row::fromValues([
            'NISN', 'Nama', 'L/P', 'Tahun Masuk', 'Tahun Lulus', 'Peminatan',
            'Status Kegiatan', 'Status Akun', 'No. WA', 'Email', 'Kota', 'Provinsi',
        ]));

        $this->alumniService->query($filters)->lazy(500)->each(function (User $user) use ($writer) {
            $profile = $user->profile;

            $writer->addRow(Row::fromValues([
                (string) $user->nisn,
                $user->name,
                $profile?->gender ?? '',
                $profile?->entry_year ?? '',
                $profile?->graduation_year ?? '',
                $profile?->major ?? '',
                $this->activityLabel($profile?->current_status),
                $user->status instanceof AccountStatus ? $this->accountLabel($user->status) : '',
                $profile?->phone_number ?? '',
                $user->email ?? '',
                $profile?->city ?? '',
                $profile?->province ?? '',
            ]));
        });

        $writer->close();
    }

    private function activityLabel(?string $status): string
    {
        return $status === null ? '' : (AlumniStatus::tryFrom($status)?->label() ?? $status);
    }

    private function accountLabel(AccountStatus $status): string
    {
        return match ($status) {
            AccountStatus::Active => 'Aktif',
            AccountStatus::Pending => 'Menunggu Verifikasi',
            AccountStatus::Inactive => 'Nonaktif',
        };
    }
}
