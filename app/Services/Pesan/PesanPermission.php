<?php

namespace App\Services\Pesan;

use App\Models\User;

/**
 * Aturan boleh mengirim pesan & memblokir (PRD MSG-07, MSG-08). Dipakai controller, service, dan UI.
 */
class PesanPermission
{
    /**
     * Alasan pengiriman ditolak dalam Bahasa Indonesia, atau null bila boleh.
     */
    public function denialReason(User $sender, User $recipient): ?string
    {
        if ($sender->is($recipient)) {
            return 'Anda tidak dapat mengirim pesan ke diri sendiri.';
        }

        if (! $sender->isActive() || ! $recipient->isActive()) {
            return 'Akun ini sedang tidak aktif, sehingga pesan tidak dapat dikirim.';
        }

        if ($sender->hasBlocked($recipient)) {
            return 'Anda memblokir pengguna ini. Buka blokir untuk mengirim pesan.';
        }

        if ($recipient->hasBlocked($sender)) {
            return 'Anda tidak dapat membalas percakapan ini.';
        }

        if ($sender->isAlumni() && $recipient->isAlumni() && ! ($recipient->profile?->allow_alumni_messages ?? true)) {
            return 'Pengguna ini tidak menerima pesan dari sesama alumni.';
        }

        return null;
    }

    public function canMessage(User $sender, User $recipient): bool
    {
        return $this->denialReason($sender, $recipient) === null;
    }

    /**
     * Tidak bisa memblokir diri sendiri, dan alumni tidak bisa memblokir admin.
     */
    public function canBlock(User $blocker, User $target): bool
    {
        if ($blocker->is($target)) {
            return false;
        }

        return ! ($blocker->isAlumni() && $target->isAdmin());
    }
}
