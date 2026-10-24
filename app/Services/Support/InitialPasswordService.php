<?php

namespace App\Services\Support;

use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;
use InvalidArgumentException;

class InitialPasswordService
{
    /**
     * Membuat kata sandi awal alumni (PRD ALM-06 & AUTH-05).
     *
     * Aturannya: tanggal lahir dengan format ddmmyyyy; bila tanggal lahir kosong,
     * dipakai NISN. Akun yang memakai kata sandi ini wajib menggantinya saat
     * onboarding (`first_login = true`).
     *
     * @throws InvalidArgumentException bila tanggal lahir dan NISN sama-sama kosong.
     */
    public function generate(CarbonInterface|string|null $birthDate, ?string $nisn): string
    {
        if ($birthDate !== null && $birthDate !== '') {
            $date = $birthDate instanceof CarbonInterface ? $birthDate : Carbon::parse($birthDate);

            return $date->format('dmY');
        }

        $nisn = trim((string) $nisn);

        if ($nisn === '') {
            throw new InvalidArgumentException('Kata sandi awal membutuhkan tanggal lahir atau NISN.');
        }

        return $nisn;
    }

    /**
     * Keterangan singkat untuk disampaikan ke alumni (mis. di templat WhatsApp :password_hint).
     */
    public function describe(CarbonInterface|string|null $birthDate): string
    {
        return ($birthDate !== null && $birthDate !== '')
            ? 'tanggal lahir Anda dengan format ddmmyyyy (contoh: 17082005)'
            : 'NISN Anda';
    }
}
