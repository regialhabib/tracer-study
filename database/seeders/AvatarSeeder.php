<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

/**
 * Membuat foto profil ilustrasi (SVG) untuk pengguna contoh yang belum memiliki foto:
 * santri putra berpeci, santri putri berjilbab. Warna dipilih tetap per pengguna.
 */
class AvatarSeeder extends Seeder
{
    /**
     * @var list<array{0: string, 1: string}>
     */
    private const BACKGROUNDS = [
        ['#dcfce7', '#bbf7d0'],
        ['#e0f2fe', '#bae6fd'],
        ['#ede9fe', '#ddd6fe'],
        ['#fef3c7', '#fde68a'],
        ['#fce7f3', '#fbcfe8'],
        ['#ccfbf1', '#99f6e4'],
    ];

    /**
     * @var list<string>
     */
    private const SKIN_TONES = ['#f5d0b5', '#e8b996', '#d6a07c', '#c68863'];

    /**
     * @var list<string>
     */
    private const OUTFITS_PUTRA = ['#15803d', '#0369a1', '#4338ca', '#0f766e', '#475569', '#92400e'];

    /**
     * @var list<string>
     */
    private const OUTFITS_PUTRI = ['#15803d', '#0f766e', '#7c3aed', '#be185d', '#0369a1', '#b45309'];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::query()
            ->whereNull('avatar_path')
            ->with('profile')
            ->each(function (User $user): void {
                $path = "avatars/contoh-{$user->id}.svg";
                $isPutri = $user->profile?->gender === 'P';

                Storage::disk('public')->put($path, $this->svg(crc32($user->name), $isPutri));

                $user->update(['avatar_path' => $path]);
            });
    }

    private function svg(int $seed, bool $isPutri): string
    {
        [$backgroundFrom, $backgroundTo] = self::BACKGROUNDS[$seed % count(self::BACKGROUNDS)];
        $skin = self::SKIN_TONES[intdiv($seed, 7) % count(self::SKIN_TONES)];
        $outfits = $isPutri ? self::OUTFITS_PUTRI : self::OUTFITS_PUTRA;
        $outfit = $outfits[intdiv($seed, 31) % count($outfits)];
        $figure = $isPutri ? $this->putri($skin, $outfit) : $this->putra($skin, $outfit);

        return <<<SVG
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
          <defs>
            <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="{$backgroundFrom}"/>
              <stop offset="1" stop-color="{$backgroundTo}"/>
            </linearGradient>
          </defs>
          <rect width="256" height="256" fill="url(#bg)"/>
          {$figure}
        </svg>
        SVG;
    }

    /**
     * Santri putra: baju koko berkerah dan peci hitam.
     */
    private function putra(string $skin, string $outfit): string
    {
        return <<<SVG
        <path d="M36 256c0-56 42-86 92-86s92 30 92 86z" fill="{$outfit}"/>
          <path d="M108 172l20 30 20-30z" fill="#ffffff" opacity="0.85"/>
          <rect x="112" y="138" width="32" height="38" rx="12" fill="{$skin}"/>
          <circle cx="82" cy="116" r="9" fill="{$skin}"/>
          <circle cx="174" cy="116" r="9" fill="{$skin}"/>
          <circle cx="128" cy="112" r="46" fill="{$skin}"/>
          <path d="M84 96l4-34q40-10 80 0l4 34q-44-8-88 0z" fill="#1f2937"/>
          <path d="M86 88q42-7 84 0" stroke="#374151" stroke-width="3" fill="none"/>
        SVG;
    }

    /**
     * Santri putri: jilbab menutup kepala hingga bahu.
     */
    private function putri(string $skin, string $outfit): string
    {
        return <<<SVG
        <path d="M36 256c0-56 42-86 92-86s92 30 92 86z" fill="{$outfit}" opacity="0.8"/>
          <path d="M128 52c-46 0-60 42-58 76 2 36-8 60-18 86 34-18 118-18 152 0-10-26-20-50-18-86 2-34-12-76-58-76z" fill="{$outfit}"/>
          <ellipse cx="128" cy="120" rx="34" ry="40" fill="{$skin}"/>
          <path d="M94 104q34-30 68 0" stroke="#ffffff" stroke-width="3" fill="none" opacity="0.35"/>
        SVG;
    }
}
