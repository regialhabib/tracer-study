<?php

namespace App\Services\Admin\Analitik;

use Illuminate\Support\Str;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;

class NonRespondentExportService
{
    public function __construct(private AnalitikService $analitik) {}

    public function filename(AnalitikFilter $filter): string
    {
        return 'belum-mengisi-'.Str::slug($filter->kuesioner?->title ?? 'kuesioner').'-'.now()->format('Ymd').'.xlsx';
    }

    /**
     * Menulis daftar alumni yang belum mengisi ke output (streaming).
     */
    public function stream(AnalitikFilter $filter): void
    {
        $writer = new Writer;
        $writer->openToFile('php://output');
        $writer->addRow(Row::fromValues(['NISN', 'Nama', 'Angkatan', 'No. WA', 'Tautan WhatsApp']));

        foreach ($this->analitik->nonRespondents($filter) as $item) {
            $writer->addRow(Row::fromValues([
                (string) data_get($item, 'nisn', ''),
                (string) data_get($item, 'name', ''),
                data_get($item, 'angkatan') ?? '',
                (string) data_get($item, 'phone_number', ''),
                (string) data_get($item, 'whatsapp_url', ''),
            ]));
        }

        $writer->close();
    }
}
