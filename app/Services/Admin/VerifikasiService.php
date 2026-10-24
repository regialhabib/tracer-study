<?php

namespace App\Services\Admin;

use App\Enums\AccountStatus;
use App\Models\User;
use App\Notifications\AkunDiverifikasiNotification;
use App\Services\Support\WhatsAppLinkService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Validation\ValidationException;

class VerifikasiService
{
    public function __construct(private WhatsAppLinkService $whatsAppLinkService) {}

    /**
     * Antrean pendaftar mandiri berstatus pending, terlama lebih dulu.
     */
    public function pendingQueue(int $perPage = 25): LengthAwarePaginator
    {
        $queue = User::query()
            ->alumni()
            ->pending()
            ->with('profile')
            ->oldest()
            ->paginate($perPage)
            ->withQueryString();

        return $queue;
    }

    /**
     * Menyetujui pendaftaran dan mengirim notifikasi dalam aplikasi.
     *
     * @return string|null tautan WhatsApp templat `akun_disetujui` (null bila nomor tidak ada).
     */
    public function approve(User $pendingUser, User $admin): ?string
    {
        $this->ensurePending($pendingUser);

        $pendingUser->forceFill([
            'status' => AccountStatus::Active,
            'rejection_reason' => null,
            'verified_at' => now(),
            'verified_by' => $admin->id,
        ])->save();

        $pendingUser->notify(new AkunDiverifikasiNotification);

        return $this->approvalWhatsAppUrl($pendingUser);
    }

    /**
     * Menolak pendaftaran: akun menjadi nonaktif beserta alasannya.
     */
    public function reject(User $pendingUser, string $reason): void
    {
        $this->ensurePending($pendingUser);

        $pendingUser->forceFill([
            'status' => AccountStatus::Inactive,
            'rejection_reason' => $reason,
        ])->save();
    }

    private function approvalWhatsAppUrl(User $user): ?string
    {
        return $this->whatsAppLinkService->buildTemplateUrl(
            $user->profile?->phone_number,
            'akun_disetujui',
            ['nama' => $user->name, 'url' => route('login')],
        );
    }

    private function ensurePending(User $user): void
    {
        if (! $user->isAlumni() || ! $user->isPending()) {
            throw ValidationException::withMessages([
                'status' => 'Akun ini sudah tidak berstatus menunggu verifikasi.',
            ]);
        }
    }
}
