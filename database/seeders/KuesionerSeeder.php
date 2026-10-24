<?php

namespace Database\Seeders;

use App\Enums\KuesionerStatus;
use App\Enums\MetricKey;
use App\Enums\QuestionType;
use App\Enums\ResponStatus;
use App\Models\JawabanKuesioner;
use App\Models\Kuesioner;
use App\Models\Pertanyaan;
use App\Models\ResponKuesioner;
use App\Models\User;
use App\Services\Kuesioner\AnswerCodec;
use App\Services\Kuesioner\VisibilityResolver;
use Illuminate\Database\Seeder;

class KuesionerSeeder extends Seeder
{
    private const STATUS_BERAKTIVITAS = ['pengabdian', 'kuliah_islam', 'kuliah_umum', 'bekerja', 'wirausaha'];

    public function __construct(
        private readonly AnswerCodec $codec = new AnswerCodec,
        private readonly VisibilityResolver $resolver = new VisibilityResolver,
    ) {}

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $aktif = $this->seedKuesionerAktif();
        $ditutup = $this->seedKuesionerDitutup();

        $this->seedResponAktif($aktif);
        $this->seedResponDitutup($ditutup);
    }

    /**
     * @return array{kuesioner: Kuesioner, pertanyaan: array<string, Pertanyaan>}
     */
    private function seedKuesionerAktif(): array
    {
        $kuesioner = Kuesioner::create([
            'title' => 'Tracer Study Alumni Tahun Kelulusan 2022–2024',
            'description' => 'Kuesioner penelusuran alumni untuk memetakan kegiatan setelah lulus, penghasilan, dan evaluasi pembelajaran di pesantren.',
            'target_graduation_years' => [2022, 2023, 2024],
            'start_date' => now()->subDays(10)->toDateString(),
            'end_date' => now()->addDays(60)->toDateString(),
            'status' => KuesionerStatus::Active,
        ]);

        $aktivitas = 'Aktivitas Saat Ini';
        $pekerjaan = 'Pekerjaan & Studi Lanjut';
        $evaluasi = 'Evaluasi Pembelajaran';
        $penutup = 'Saran & Harapan';

        $definisi = [
            ['status', $aktivitas, 'Apa kegiatan utama Anda saat ini?', QuestionType::Radio, MetricKey::StatusKegiatan->presetOptions(), 'status_kegiatan', true, 'Pilih satu yang paling menggambarkan kegiatan Anda sekarang.', null],
            ['lembaga', $aktivitas, 'Apa nama kampus, lembaga, atau tempat kerja Anda?', QuestionType::Text, null, 'nama_lembaga', true, null, $this->dalam('status', self::STATUS_BERAKTIVITAS)],
            ['tunggu', $aktivitas, 'Berapa bulan masa tunggu sejak lulus hingga memulai kegiatan tersebut?', QuestionType::Number, null, 'masa_tunggu_bulan', true, 'Isi 0 bila langsung memulai setelah lulus.', null],
            ['mulai', $aktivitas, 'Kapan Anda mulai menjalani kegiatan tersebut?', QuestionType::Date, null, null, false, 'Perkiraan tanggal sudah cukup.', $this->dalam('status', self::STATUS_BERAKTIVITAS)],

            ['pendapatan', $pekerjaan, 'Berapa rentang penghasilan Anda per bulan?', QuestionType::Radio, MetricKey::RentangPendapatan->presetOptions(), 'rentang_pendapatan', true, 'Jawaban Anda hanya ditampilkan sebagai data agregat.', $this->dalam('status', ['bekerja', 'wirausaha'])],
            ['bidang', $pekerjaan, 'Di bidang apa Anda bekerja atau berusaha?', QuestionType::Select, $this->opsi(['pendidikan' => 'Pendidikan & dakwah', 'teknologi' => 'Teknologi & digital', 'perdagangan' => 'Perdagangan & jasa', 'kesehatan' => 'Kesehatan', 'lainnya' => 'Lainnya']), null, true, null, $this->dalam('status', ['bekerja', 'wirausaha'])],
            ['sesuai', $pekerjaan, 'Apakah pekerjaan Anda sesuai dengan bekal yang diperoleh di pesantren?', QuestionType::Radio, $this->opsi(['sesuai' => 'Sesuai', 'sebagian' => 'Sebagian sesuai', 'tidak' => 'Tidak sesuai']), null, false, null, $this->dalam('status', ['bekerja', 'wirausaha'])],
            ['jenis_studi', $pekerjaan, 'Program studi apa yang Anda tempuh?', QuestionType::Select, $this->opsi(['agama' => 'Ilmu agama', 'saintek' => 'Sains & teknologi', 'sosial' => 'Sosial & humaniora', 'lainnya' => 'Lainnya']), null, true, null, $this->dalam('status', ['kuliah_islam', 'kuliah_umum'])],
            ['kendala', $pekerjaan, 'Kendala apa yang Anda hadapi dalam mencari pekerjaan?', QuestionType::Checkbox, $this->opsi(['lowongan' => 'Lowongan terbatas', 'keterampilan' => 'Keterampilan belum sesuai', 'jaringan' => 'Kurang jejaring', 'lokasi' => 'Lokasi jauh']), null, false, 'Boleh memilih lebih dari satu.', $this->sama('status', 'mencari_kerja')],

            ['relevansi', $evaluasi, 'Seberapa besar ilmu dari pesantren relevan dengan kegiatan Anda sekarang?', QuestionType::Rating, null, 'relevansi_ilmu', true, null, null],
            ['akhlak', $evaluasi, 'Seberapa bermanfaat pembinaan akhlak dan adab bagi Anda?', QuestionType::Rating, null, null, true, null, null],
            ['bahasa', $evaluasi, 'Seberapa puas Anda terhadap pembelajaran bahasa Arab dan Inggris?', QuestionType::Rating, null, null, false, null, null],
            ['skill', $evaluasi, 'Keterampilan apa yang perlu diperkuat untuk adik-adik santri?', QuestionType::Checkbox, $this->opsi(['bahasa_arab' => 'Bahasa Arab & kitab kuning', 'bahasa_inggris' => 'Bahasa Inggris', 'digital' => 'Kecakapan digital', 'wirausaha' => 'Kewirausahaan', 'riset' => 'Riset & penulisan ilmiah']), 'kebutuhan_keterampilan', true, 'Boleh memilih lebih dari satu.', null],
            ['metode', $evaluasi, 'Metode pembelajaran mana yang paling membantu Anda?', QuestionType::Select, $this->opsi(['halaqah' => 'Halaqah & sorogan', 'kelas' => 'Kelas formal', 'organisasi' => 'Organisasi & kegiatan santri', 'tahfidz' => 'Tahfidz']), null, false, null, null],
            ['pelatihan', $evaluasi, 'Apakah Anda pernah mengikuti pelatihan setelah lulus?', QuestionType::Radio, $this->opsi(['ya' => 'Pernah', 'tidak' => 'Belum pernah']), null, true, null, null],
            ['nama_pelatihan', $evaluasi, 'Pelatihan apa yang Anda ikuti?', QuestionType::Text, null, null, false, null, $this->sama('pelatihan', 'ya')],

            ['saran', $penutup, 'Tuliskan saran atau harapan Anda untuk almamater.', QuestionType::Textarea, null, null, false, 'Boleh dikosongkan.', null],
            ['mentor', $penutup, 'Bersediakah Anda menjadi narasumber atau mentor bagi adik-adik santri?', QuestionType::Radio, $this->opsi(['bersedia' => 'Bersedia', 'mungkin' => 'Mungkin, tergantung waktu', 'tidak' => 'Belum bisa']), null, true, null, null],
            ['reuni', $penutup, 'Kapan waktu reuni alumni yang Anda usulkan?', QuestionType::Date, null, null, false, null, null],
        ];

        return ['kuesioner' => $kuesioner, 'pertanyaan' => $this->createPertanyaan($kuesioner, $definisi)];
    }

    /**
     * @return array{kuesioner: Kuesioner, pertanyaan: array<string, Pertanyaan>}
     */
    private function seedKuesionerDitutup(): array
    {
        $kuesioner = Kuesioner::create([
            'title' => 'Tracer Study Alumni Periode Lalu',
            'description' => 'Periode penelusuran sebelumnya, dipakai sebagai pembanding analitik.',
            'target_graduation_years' => [2021, 2022, 2023],
            'start_date' => now()->subYear()->subDays(30)->toDateString(),
            'end_date' => now()->subYear()->addDays(30)->toDateString(),
            'status' => KuesionerStatus::Closed,
        ]);

        $aktivitas = 'Aktivitas Alumni';
        $evaluasi = 'Evaluasi & Saran';

        $definisi = [
            ['status', $aktivitas, 'Apa kegiatan utama Anda saat ini?', QuestionType::Radio, MetricKey::StatusKegiatan->presetOptions(), 'status_kegiatan', true, null, null],
            ['lembaga', $aktivitas, 'Apa nama kampus, lembaga, atau tempat kerja Anda?', QuestionType::Text, null, 'nama_lembaga', true, null, $this->dalam('status', self::STATUS_BERAKTIVITAS)],
            ['tunggu', $aktivitas, 'Berapa bulan masa tunggu sejak lulus hingga memulai kegiatan tersebut?', QuestionType::Number, null, 'masa_tunggu_bulan', true, null, null],
            ['pendapatan', $aktivitas, 'Berapa rentang penghasilan Anda per bulan?', QuestionType::Radio, MetricKey::RentangPendapatan->presetOptions(), 'rentang_pendapatan', true, null, $this->dalam('status', ['bekerja', 'wirausaha'])],
            ['relevansi', $evaluasi, 'Seberapa relevan ilmu dari pesantren dengan kegiatan Anda?', QuestionType::Rating, null, 'relevansi_ilmu', true, null, null],
            ['skill', $evaluasi, 'Keterampilan apa yang perlu diperkuat?', QuestionType::Checkbox, $this->opsi(['bahasa_arab' => 'Bahasa Arab & kitab kuning', 'bahasa_inggris' => 'Bahasa Inggris', 'digital' => 'Kecakapan digital', 'wirausaha' => 'Kewirausahaan', 'riset' => 'Riset & penulisan ilmiah']), 'kebutuhan_keterampilan', true, null, null],
            ['saran', $evaluasi, 'Tuliskan saran Anda untuk almamater.', QuestionType::Textarea, null, null, false, null, null],
        ];

        return ['kuesioner' => $kuesioner, 'pertanyaan' => $this->createPertanyaan($kuesioner, $definisi)];
    }

    /**
     * @param  list<array{0: string, 1: string, 2: string, 3: QuestionType, 4: list<array{value: string, label: string}>|null, 5: string|null, 6: bool, 7: string|null, 8: array{operator: string, key: string, value: string|list<string>}|null}>  $definisi
     * @return array<string, Pertanyaan>
     */
    private function createPertanyaan(Kuesioner $kuesioner, array $definisi): array
    {
        $dibuat = [];

        foreach ($definisi as $urutan => [$kunci, $bagian, $teks, $tipe, $opsi, $metric, $wajib, $bantuan, $aturan]) {
            $dibuat[$kunci] = Pertanyaan::create([
                'kuesioner_id' => $kuesioner->id,
                'section' => $bagian,
                'question_text' => $teks,
                'help_text' => $bantuan,
                'question_type' => $tipe,
                'options' => $opsi,
                'metric_key' => $metric,
                'is_required' => $wajib,
                'order' => $urutan + 1,
                'conditional_rule' => $aturan === null ? null : [
                    'depends_on' => $dibuat[$aturan['key']]->id,
                    'operator' => $aturan['operator'],
                    'value' => $aturan['value'],
                ],
            ]);
        }

        return $dibuat;
    }

    /**
     * @param  array{kuesioner: Kuesioner, pertanyaan: array<string, Pertanyaan>}  $data
     */
    private function seedResponAktif(array $data): void
    {
        $jawabanPerAlumni = [
            'fauzi@alumni.test' => ['terkirim' => 6, 'jawaban' => [
                'status' => 'pengabdian', 'lembaga' => 'Pondok Pesantren Cabang Kediri', 'tunggu' => 1, 'mulai' => '2024-08-01',
                'relevansi' => 5, 'akhlak' => 5, 'bahasa' => 4, 'skill' => ['bahasa_arab', 'digital'], 'metode' => 'halaqah',
                'pelatihan' => 'ya', 'nama_pelatihan' => 'Pelatihan Guru Tahfidz', 'saran' => 'Semoga pondok semakin berkah dan melahirkan santri yang tangguh.',
                'mentor' => 'bersedia', 'reuni' => now()->addMonths(3)->toDateString(),
            ]],
            'rizqi@alumni.test' => ['terkirim' => 5, 'jawaban' => [
                'status' => 'kuliah_islam', 'lembaga' => 'Universitas Al-Azhar Kairo', 'tunggu' => 3, 'mulai' => '2024-09-15',
                'jenis_studi' => 'agama', 'relevansi' => 5, 'akhlak' => 5, 'bahasa' => 5, 'skill' => ['bahasa_arab', 'riset'],
                'metode' => 'halaqah', 'pelatihan' => 'tidak', 'mentor' => 'mungkin',
            ]],
            'aisyah@alumni.test' => ['terkirim' => 4, 'jawaban' => [
                'status' => 'kuliah_umum', 'lembaga' => 'Universitas Airlangga', 'tunggu' => 2, 'jenis_studi' => 'saintek',
                'relevansi' => 4, 'akhlak' => 5, 'bahasa' => 3, 'skill' => ['bahasa_inggris', 'digital', 'riset'],
                'metode' => 'kelas', 'pelatihan' => 'tidak', 'saran' => 'Perbanyak pelatihan bahasa Inggris.', 'mentor' => 'mungkin',
            ]],
            'zainal@alumni.test' => ['terkirim' => 3, 'jawaban' => [
                'status' => 'bekerja', 'lembaga' => 'PT Mitra Digital Nusantara', 'tunggu' => 4, 'mulai' => '2023-11-01',
                'pendapatan' => '3_5jt', 'bidang' => 'teknologi', 'sesuai' => 'sebagian', 'relevansi' => 3, 'akhlak' => 5, 'bahasa' => 3,
                'skill' => ['digital', 'bahasa_inggris', 'wirausaha'], 'metode' => 'organisasi', 'pelatihan' => 'ya',
                'nama_pelatihan' => 'Bootcamp Pemrograman Web', 'mentor' => 'bersedia',
            ]],
            'wildan@alumni.test' => ['terkirim' => 2, 'jawaban' => [
                'status' => 'wirausaha', 'lembaga' => 'Toko Berkah Santri', 'tunggu' => 6, 'pendapatan' => '1_3jt', 'bidang' => 'perdagangan',
                'sesuai' => 'tidak', 'relevansi' => 3, 'akhlak' => 4, 'bahasa' => 3, 'skill' => ['wirausaha', 'digital'],
                'metode' => 'organisasi', 'pelatihan' => 'tidak', 'saran' => 'Adakan kelas kewirausahaan bagi santri akhir.', 'mentor' => 'bersedia',
            ]],
            'bilal@alumni.test' => ['terkirim' => 1, 'jawaban' => [
                'status' => 'mencari_kerja', 'tunggu' => 8, 'kendala' => ['lowongan', 'keterampilan'], 'relevansi' => 4, 'akhlak' => 5,
                'bahasa' => 4, 'skill' => ['bahasa_inggris', 'digital'], 'metode' => 'halaqah', 'pelatihan' => 'tidak', 'mentor' => 'mungkin',
            ]],
            'fajar@alumni.test' => ['terkirim' => null, 'bagian' => 'Aktivitas Saat Ini', 'jawaban' => [
                'status' => 'kuliah_umum', 'lembaga' => 'Institut Teknologi Sepuluh Nopember',
            ]],
        ];

        foreach ($jawabanPerAlumni as $email => $info) {
            $this->simpanRespon($data, $email, $info['jawaban'], $info['terkirim'] ?? null, $info['bagian'] ?? null);
        }
    }

    /**
     * @param  array{kuesioner: Kuesioner, pertanyaan: array<string, Pertanyaan>}  $data
     */
    private function seedResponDitutup(array $data): void
    {
        $this->simpanRespon($data, 'zainal@alumni.test', [
            'status' => 'bekerja', 'lembaga' => 'CV Karya Santri', 'tunggu' => 5, 'pendapatan' => '1_3jt',
            'relevansi' => 3, 'skill' => ['digital', 'bahasa_inggris'], 'saran' => 'Perbanyak pelatihan keterampilan kerja.',
        ], 330);

        $this->simpanRespon($data, 'wildan@alumni.test', [
            'status' => 'wirausaha', 'lembaga' => 'Warung Kopi Santri', 'tunggu' => 7, 'pendapatan' => 'lt_1jt',
            'relevansi' => 4, 'skill' => ['wirausaha'],
        ], 320);
    }

    /**
     * Simpan satu respon. Jawaban pertanyaan yang tersembunyi dibuang agar konsisten dengan logika kondisional.
     *
     * @param  array{kuesioner: Kuesioner, pertanyaan: array<string, Pertanyaan>}  $data
     * @param  array<string, mixed>  $jawaban  nilai bertipe dikunci kunci lokal pertanyaan
     * @param  int|null  $hariLalu  null = draf; angka = hari sejak dikirim
     */
    private function simpanRespon(array $data, string $email, array $jawaban, ?int $hariLalu, ?string $bagianDraf = null): void
    {
        $alumni = User::where('email', $email)->with('profile')->first();

        if (! $alumni) {
            return;
        }

        $kuesioner = $data['kuesioner'];
        $pertanyaan = collect($data['pertanyaan']);
        $nilaiById = [];

        foreach ($jawaban as $kunci => $nilai) {
            if (isset($data['pertanyaan'][$kunci])) {
                $nilaiById[$data['pertanyaan'][$kunci]->id] = $nilai;
            }
        }

        $visibilitas = $this->resolver->resolve($pertanyaan->values(), $nilaiById);
        $terkirim = $hariLalu !== null;
        $bagianTerakhir = $pertanyaan->last()->section;

        $respon = ResponKuesioner::create([
            'kuesioner_id' => $kuesioner->id,
            'user_id' => $alumni->id,
            'status' => $terkirim ? ResponStatus::Submitted : ResponStatus::Draft,
            'current_section' => $terkirim ? $bagianTerakhir : $bagianDraf,
            'submitted_at' => $terkirim ? now()->subDays($hariLalu) : null,
        ]);

        foreach ($pertanyaan as $item) {
            $nilai = $nilaiById[$item->id] ?? null;

            if (! ($visibilitas[$item->id] ?? false) || $nilai === null) {
                continue;
            }

            $teks = $this->codec->encode($item->question_type, $nilai);

            if ($teks === null) {
                continue;
            }

            JawabanKuesioner::create([
                'respon_kuesioner_id' => $respon->id,
                'kuesioner_id' => $kuesioner->id,
                'user_id' => $alumni->id,
                'pertanyaan_id' => $item->id,
                'answer' => $teks,
            ]);
        }

        $statusKegiatan = $jawaban['status'] ?? null;

        if ($terkirim && $kuesioner->status === KuesionerStatus::Active && $statusKegiatan !== null && $alumni->profile) {
            $alumni->profile->update(['current_status' => $statusKegiatan]);
        }
    }

    /**
     * @param  array<string, string>  $pasangan  value => label
     * @return list<array{value: string, label: string}>
     */
    private function opsi(array $pasangan): array
    {
        return array_map(
            fn (string $value, string $label): array => ['value' => $value, 'label' => $label],
            array_keys($pasangan),
            array_values($pasangan),
        );
    }

    /**
     * @param  list<string>  $nilai
     * @return array{operator: string, key: string, value: list<string>}
     */
    private function dalam(string $kunci, array $nilai): array
    {
        return ['operator' => 'in', 'key' => $kunci, 'value' => $nilai];
    }

    /**
     * @return array{operator: string, key: string, value: string}
     */
    private function sama(string $kunci, string $nilai): array
    {
        return ['operator' => 'equals', 'key' => $kunci, 'value' => $nilai];
    }
}
