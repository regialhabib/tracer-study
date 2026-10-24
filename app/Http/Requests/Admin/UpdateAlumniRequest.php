<?php

namespace App\Http\Requests\Admin;

class UpdateAlumniRequest extends StoreAlumniRequest
{
    /**
     * Akun alumni yang sedang disunting dikecualikan dari pengecekan unik (termasuk yang sudah dihapus).
     */
    protected function ignoredUserId(): ?int
    {
        return (int) $this->route('alumni');
    }
}
