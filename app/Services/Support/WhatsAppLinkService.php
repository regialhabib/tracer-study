<?php

namespace App\Services\Support;

use InvalidArgumentException;

class WhatsAppLinkService
{
    /**
     * Panjang minimal & maksimal nomor internasional (E.164, tanpa "+").
     */
    private const MIN_DIGITS = 10;

    private const MAX_DIGITS = 15;

    /**
     * Menormalkan nomor WhatsApp mentah (08…, +62…, 62…, 8…) menjadi format wa.me (62…).
     *
     * Mengembalikan null bila nomor kosong atau panjangnya tidak masuk akal.
     */
    public function normalizePhoneNumber(?string $rawPhoneNumber): ?string
    {
        $rawPhoneNumber = trim((string) $rawPhoneNumber);

        if ($rawPhoneNumber === '') {
            return null;
        }

        $countryCode = (string) config('tracer.default_country_code', '62');
        $digits = preg_replace('/\D+/', '', $rawPhoneNumber);

        $normalized = match (true) {
            str_starts_with($rawPhoneNumber, '+') => $digits,
            str_starts_with($digits, '00') => substr($digits, 2),
            str_starts_with($digits, '0') => $countryCode.substr($digits, 1),
            str_starts_with($digits, $countryCode) => $digits,
            str_starts_with($digits, '8') => $countryCode.$digits,
            default => $digits,
        };

        $length = strlen($normalized);

        if ($length < self::MIN_DIGITS || $length > self::MAX_DIGITS) {
            return null;
        }

        return $normalized;
    }

    /**
     * Membangun tautan https://wa.me/62…?text=… dari nomor mentah dan pesan opsional.
     *
     * Mengembalikan null bila nomor tidak valid, agar UI bisa menonaktifkan tombol.
     */
    public function buildUrl(?string $rawPhoneNumber, ?string $message = null): ?string
    {
        $phoneNumber = $this->normalizePhoneNumber($rawPhoneNumber);

        if ($phoneNumber === null) {
            return null;
        }

        $url = 'https://wa.me/'.$phoneNumber;

        if ($message !== null && $message !== '') {
            $url .= '?text='.rawurlencode($message);
        }

        return $url;
    }

    /**
     * Membangun tautan wa.me berisi templat dari `config('tracer.whatsapp_templates')`.
     *
     * @param  array<string, string|int|null>  $replacements  mis. ['nama' => 'Ahmad', 'url' => 'https://…']
     *
     * @throws InvalidArgumentException bila kunci templat tidak dikenal.
     */
    public function buildTemplateUrl(?string $rawPhoneNumber, string $templateKey, array $replacements = []): ?string
    {
        return $this->buildUrl($rawPhoneNumber, $this->renderTemplate($templateKey, $replacements));
    }

    /**
     * Mengisi placeholder `:kunci` pada templat pesan WhatsApp.
     *
     * @param  array<string, string|int|null>  $replacements
     *
     * @throws InvalidArgumentException bila kunci templat tidak dikenal.
     */
    public function renderTemplate(string $templateKey, array $replacements = []): string
    {
        $template = config("tracer.whatsapp_templates.{$templateKey}");

        if (! is_string($template)) {
            throw new InvalidArgumentException("Templat WhatsApp [{$templateKey}] tidak ditemukan.");
        }

        $placeholders = [];

        foreach ($replacements as $key => $value) {
            $placeholders[':'.ltrim((string) $key, ':')] = (string) $value;
        }

        return strtr($template, $placeholders);
    }
}
