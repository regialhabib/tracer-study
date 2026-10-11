<?php

namespace Database\Seeders;

use App\Models\JawabanKuesioner;
use App\Models\Kuesioner;
use App\Models\Pertanyaan;
use App\Models\User;
use Illuminate\Database\Seeder;

class KuesionerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $kuesioner = Kuesioner::create([
            'title' => 'Tracer Study Alumni MA & Pondok Pesantren Tahun Kelulusan 2024',
            'description' => 'Kuesioner penelusuran rekam jejak alumni santri untuk memetakan capaian khidmah, studi lanjut, dan dunia profesional serta evaluasi kurikulum madrasah.',
            'target_graduation_years' => [2022, 2023, 2024],
            'start_date' => now()->subDays(10)->toDateString(),
            'end_date' => now()->addDays(60)->toDateString(),
            'is_active' => true,
        ]);

        $pertanyaanData = [
            [
                'section' => 'Aktivitas Pasca Kelulusan',
                'question_text' => 'Apa aktivitas utama Anda saat ini?',
                'question_type' => 'radio',
                'options' => [
                    'Pengabdian / Khidmah di Pondok',
                    'Melanjutkan Studi Keagamaan / Timur Tengah / Ma\'had Aly',
                    'Melanjutkan Studi PTN / PTS Umum',
                    'Bekerja di Sektor Formal / Swasta',
                    'Wirausaha / Bisnis Mandiri',
                    'Belum Bekerja / Sedang Menunggu Peluang',
                ],
                'metric_key' => 'status_kegiatan',
                'is_required' => true,
                'order' => 1,
            ],
            [
                'section' => 'Aktivitas Pasca Kelulusan',
                'question_text' => 'Nama Perguruan Tinggi / Lembaga Khidmah / Tempat Kerja Anda saat ini:',
                'question_type' => 'text',
                'options' => null,
                'metric_key' => 'nama_lembaga',
                'is_required' => true,
                'order' => 2,
            ],
            [
                'section' => 'Aktivitas Pasca Kelulusan',
                'question_text' => 'Berapa lama masa tunggu (dalam bulan) sejak wisuda hingga memulai aktivitas tersebut?',
                'question_type' => 'number',
                'options' => null,
                'metric_key' => 'masa_tunggu_bulan',
                'is_required' => true,
                'order' => 3,
            ],
            [
                'section' => 'Evaluasi Pembelajaran & Nilai Kepesantrenan',
                'question_text' => 'Seberapa besar manfaat ilmu agama dan pembiasaan adab pesantren terhadap aktivitas Anda sekarang? (Skala 1 - 5)',
                'question_type' => 'rating',
                'options' => ['1', '2', '3', '4', '5'],
                'metric_key' => 'relevansi_adab_ilmu',
                'is_required' => true,
                'order' => 4,
            ],
            [
                'section' => 'Evaluasi Pembelajaran & Nilai Kepesantrenan',
                'question_text' => 'Keterampilan apa yang menurut Anda paling perlu ditingkatkan untuk adik-adik santri MA ke depan?',
                'question_type' => 'checkbox',
                'options' => [
                    'Bahasa Arab Komunikatif & Kitab Turats',
                    'Bahasa Inggris Internasional',
                    'Kecakapan Digital & Pemrograman IT',
                    'Kewirausahaan / Santripreneur',
                    'Metodologi Riset & Penulisan Ilmiah',
                ],
                'metric_key' => 'keterampilan_prioritas',
                'is_required' => true,
                'order' => 5,
            ],
            [
                'section' => 'Saran & Harapan',
                'question_text' => 'Tuliskan pesan, saran, atau doa Anda untuk kemajuan almamater tercinta:',
                'question_type' => 'textarea',
                'options' => null,
                'metric_key' => 'saran_alumni',
                'is_required' => false,
                'order' => 6,
            ],
        ];

        $pertanyaanModels = [];
        foreach ($pertanyaanData as $p) {
            $pertanyaanModels[] = Pertanyaan::create([
                ...$p,
                'kuesioner_id' => $kuesioner->id,
            ]);
        }

        // Isi respon sampel untuk Fauzi (Pengabdian)
        $fauzi = User::where('email', 'fauzi@alumni.test')->first();
        if ($fauzi) {
            JawabanKuesioner::create([
                'kuesioner_id' => $kuesioner->id,
                'user_id' => $fauzi->id,
                'pertanyaan_id' => $pertanyaanModels[0]->id,
                'answer' => 'Pengabdian / Khidmah di Pondok',
            ]);
            JawabanKuesioner::create([
                'kuesioner_id' => $kuesioner->id,
                'user_id' => $fauzi->id,
                'pertanyaan_id' => $pertanyaanModels[1]->id,
                'answer' => 'Pondok Pesantren Cabang Kediri (Guru Tugas Tahfidz)',
            ]);
            JawabanKuesioner::create([
                'kuesioner_id' => $kuesioner->id,
                'user_id' => $fauzi->id,
                'pertanyaan_id' => $pertanyaanModels[2]->id,
                'answer' => '1',
            ]);
            JawabanKuesioner::create([
                'kuesioner_id' => $kuesioner->id,
                'user_id' => $fauzi->id,
                'pertanyaan_id' => $pertanyaanModels[3]->id,
                'answer' => '5',
            ]);
            JawabanKuesioner::create([
                'kuesioner_id' => $kuesioner->id,
                'user_id' => $fauzi->id,
                'pertanyaan_id' => $pertanyaanModels[4]->id,
                'answer' => json_encode(['Bahasa Arab Komunikatif & Kitab Turats', 'Kecakapan Digital & Pemrograman IT']),
            ]);
            JawabanKuesioner::create([
                'kuesioner_id' => $kuesioner->id,
                'user_id' => $fauzi->id,
                'pertanyaan_id' => $pertanyaanModels[5]->id,
                'answer' => 'Semoga pondok kita semakin berkah, melahirkan santri yang faqih fiddin dan tangguh menghadapi zaman.',
            ]);
        }

        // Isi respon sampel untuk Rizqi (Kuliah Islam)
        $rizqi = User::where('email', 'rizqi@alumni.test')->first();
        if ($rizqi) {
            JawabanKuesioner::create([
                'kuesioner_id' => $kuesioner->id,
                'user_id' => $rizqi->id,
                'pertanyaan_id' => $pertanyaanModels[0]->id,
                'answer' => 'Melanjutkan Studi Keagamaan / Timur Tengah / Ma\'had Aly',
            ]);
            JawabanKuesioner::create([
                'kuesioner_id' => $kuesioner->id,
                'user_id' => $rizqi->id,
                'pertanyaan_id' => $pertanyaanModels[1]->id,
                'answer' => 'Universitas Al-Azhar Kairo (Kulliyyah Ushuluddin)',
            ]);
            JawabanKuesioner::create([
                'kuesioner_id' => $kuesioner->id,
                'user_id' => $rizqi->id,
                'pertanyaan_id' => $pertanyaanModels[2]->id,
                'answer' => '3',
            ]);
            JawabanKuesioner::create([
                'kuesioner_id' => $kuesioner->id,
                'user_id' => $rizqi->id,
                'pertanyaan_id' => $pertanyaanModels[3]->id,
                'answer' => '5',
            ]);
            JawabanKuesioner::create([
                'kuesioner_id' => $kuesioner->id,
                'user_id' => $rizqi->id,
                'pertanyaan_id' => $pertanyaanModels[4]->id,
                'answer' => json_encode(['Bahasa Arab Komunikatif & Kitab Turats', 'Metodologi Riset & Penulisan Ilmiah']),
            ]);
        }
    }
}
