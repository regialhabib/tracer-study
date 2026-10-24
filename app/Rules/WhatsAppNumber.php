<?php

namespace App\Rules;

use App\Services\Support\WhatsAppLinkService;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

class WhatsAppNumber implements ValidationRule
{
    /**
     * Memastikan nomor bisa dipakai untuk tautan wa.me (08…, +62…, 62…).
     *
     * @param  Closure(string, ?string=): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $isWellFormed = is_string($value) && preg_match('/^\+?[0-9\s\-().]+$/', trim($value)) === 1;

        if (! $isWellFormed || app(WhatsAppLinkService::class)->normalizePhoneNumber($value) === null) {
            $fail('Nomor WhatsApp tidak valid. Gunakan format seperti 081234567890.');
        }
    }
}
