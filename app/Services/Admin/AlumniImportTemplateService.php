<?php

namespace App\Services\Admin;

use OpenSpout\Common\Entity\Row;
use OpenSpout\Common\Entity\Style\Style;
use OpenSpout\Writer\XLSX\Writer;

class AlumniImportTemplateService
{
    /**
     * Kepala kolom templat; urutannya dipakai persis oleh AlumniImportService.
     *
     * @var list<string>
     */
    public const HEADERS = ['NISN', 'Nama', 'L/P', 'Tahun Masuk', 'Tahun Lulus', 'Peminatan', 'No. WA', 'Tanggal Lahir (DD-MM-YYYY)'];

    /**
     * Membuat berkas templat xlsx sementara dan mengembalikan path-nya.
     */
    public function build(): string
    {
        $path = tempnam(sys_get_temp_dir(), 'tpl-alumni-').'.xlsx';

        $writer = new Writer;
        $writer->openToFile($path);
        $writer->getCurrentSheet()->setName('Data Alumni');

        $writer->addRow(Row::fromValuesWithStyle(self::HEADERS, new Style(fontBold: true)));
        $writer->addRow(Row::fromValues(['0000000000', 'Contoh Nama Alumni', 'L', '2019', '2022', 'Keagamaan (PK)', '081234567890', '17-08-2004']));

        $writer->addNewSheetAndMakeItCurrent()->setName('Petunjuk');
        foreach ($this->instructions() as $line) {
            $writer->addRow(Row::fromValues([$line]));
        }

        $writer->close();

        return $path;
    }

    /**
     * @return list<string>
     */
    private function instructions(): array
    {
        return [
            'Petunjuk Pengisian Templat Import Alumni',
            '1. Isi data mulai baris ke-2 pada sheet "Data Alumni". Hapus baris contoh (NISN 0000000000) sebelum mengunggah.',
            '2. NISN wajib, terdiri dari 10 digit angka, dan belum terdaftar di sistem. Format kolom NISN sebagai Teks agar angka 0 di depan tidak hilang.',
            '3. Nama wajib diisi.',
            '4. L/P diisi huruf L (laki-laki) atau P (perempuan).',
            '5. Tahun Masuk dan Tahun Lulus wajib 4 digit; Tahun Masuk tidak boleh lebih besar dari Tahun Lulus.',
            '6. Peminatan wajib diisi, contoh: Keagamaan (PK), MIPA, IPS, Bahasa.',
            '7. No. WA boleh dikosongkan. Bila diisi, gunakan format seperti 081234567890.',
            '8. Tanggal Lahir boleh dikosongkan. Gunakan format DD-MM-YYYY (contoh 17-08-2004) atau DD/MM/YYYY.',
            '9. Kata sandi awal alumni adalah tanggal lahir (ddmmyyyy). Bila tanggal lahir kosong, dipakai NISN. Alumni wajib menggantinya saat login pertama.',
            '10. Ukuran berkas maksimal 5 MB dan maksimal 2.000 baris data.',
        ];
    }
}
