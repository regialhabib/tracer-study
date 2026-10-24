<?php

namespace App\Services\Admin\Analitik;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class LaporanPdfService
{
    public function __construct(private AnalitikService $analitik) {}

    public function filename(AnalitikFilter $filter): string
    {
        return 'laporan-'.Str::slug($filter->kuesioner?->title ?? 'kuesioner').'-'.now()->format('Ymd').'.pdf';
    }

    /**
     * Menghasilkan isi PDF A4 portrait; seluruh angka berasal dari AnalitikService.
     */
    public function render(AnalitikFilter $filter): string
    {
        $kuesioner = $filter->kuesioner;
        Carbon::setLocale('id');

        return Pdf::loadView('pdf.laporan-analitik', [
            'logo' => $this->logoDataUri(),
            'kuesioner' => $kuesioner,
            'periode' => $kuesioner->start_date->translatedFormat('j F Y').' – '.$kuesioner->end_date->translatedFormat('j F Y'),
            'filterLabels' => $this->filterLabels($filter),
            'tanggalCetak' => now()->translatedFormat('j F Y'),
            'summary' => $this->analitik->summary($filter),
            'perAngkatan' => $this->analitik->responseRateByAngkatan($filter),
            'statusDistribution' => $this->analitik->statusDistribution($filter),
            'masaTunggu' => $this->analitik->masaTunggu($filter),
            'pendapatan' => $this->analitik->pendapatan($filter),
            'topLembaga' => $this->analitik->topLembaga($filter),
            'relevansiIlmu' => $this->analitik->relevansiIlmu($filter),
        ])->setPaper('a4', 'portrait')->setOption('isFontSubsettingEnabled', true)->output();
    }

    /**
     * @return list<string>
     */
    private function filterLabels(AnalitikFilter $filter): array
    {
        return array_values(array_filter([
            $filter->angkatan !== [] ? 'Angkatan: '.implode(', ', $filter->angkatan) : null,
            $filter->gender !== null ? 'Jenis kelamin: '.($filter->gender === 'L' ? 'Laki-laki' : 'Perempuan') : null,
            $filter->major !== null ? 'Peminatan: '.$filter->major : null,
        ]));
    }

    /**
     * Logo sebagai PNG base64 (dompdf tidak andal membaca webp); null bila GD/berkas tidak tersedia.
     */
    private function logoDataUri(): ?string
    {
        $path = public_path('images/logo.webp');

        if (! is_file($path) || ! function_exists('imagecreatefromwebp')) {
            return null;
        }

        $image = @imagecreatefromwebp($path);

        if ($image === false) {
            return null;
        }

        ob_start();
        imagepng($image);
        $png = (string) ob_get_clean();
        imagedestroy($image);

        return 'data:image/png;base64,'.base64_encode($png);
    }
}
