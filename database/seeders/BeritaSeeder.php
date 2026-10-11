<?php

namespace Database\Seeders;

use App\Models\Berita;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BeritaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first() ?? User::factory()->admin()->create();

        $posts = [
            [
                'type' => 'berita',
                'title' => 'Haflah Akhirussanah & Khotmil Qur\'an Santri MA Angkatan 2024 Berlangsung Khidmat',
                'slug' => Str::slug('Haflah Akhirussanah & Khotmil Qur\'an Santri MA Angkatan 2024 Berlangsung Khidmat'),
                'content' => 'Alhamdulillah, peringatan Haflah Akhirussanah dan Khotmil Qur\'an serta Kitab bagi santri Madrasah Aliyah berlangsung dengan penuh haru dan khidmat. Sebanyak 120 santriwan dan santriwati resmi diwisuda dan bersiap melanjutkan estafet khidmah serta studi lanjut.',
                'event_date' => null,
                'location' => null,
                'registration_link' => null,
                'status' => 'published',
                'published_at' => now()->subDays(15),
            ],
            [
                'type' => 'agenda',
                'title' => 'Silaturahmi Akbar & Temu Kangen Alumni Nasional (IKAPAS) 2026',
                'slug' => Str::slug('Silaturahmi Akbar & Temu Kangen Alumni Nasional (IKAPAS) 2026'),
                'content' => 'Mengundang seluruh alumni lintas angkatan untuk hadir dalam agenda temu alumni nasional yang bertempat di halaman utama pondok pesantren. Agenda meliputi do\'a bersama masyayikh, bincang karir alumni, dan musyawarah ikatan alumni.',
                'event_date' => now()->addDays(25)->setHour(8)->setMinute(0),
                'location' => 'Aula Utama & Halaman Pondok Pesantren',
                'registration_link' => 'https://pesantren.sch.id/reuni-2026',
                'status' => 'published',
                'published_at' => now()->subDays(5),
            ],
            [
                'type' => 'info_beasiswa',
                'title' => 'Pendaftaran Seleksi Beasiswa S1 Universitas Al-Azhar Kairo Mesir Resmi Dibuka',
                'slug' => Str::slug('Pendaftaran Seleksi Beasiswa S1 Universitas Al-Azhar Kairo Mesir Resmi Dibuka'),
                'content' => 'Bagi para alumni MA peminatan Keagamaan dan program Kitab Kuning, Kementerian Agama bersama Kedutaan Besar Mesir telah membuka seleksi berkas dan tes kemampuan bahasa Arab (Ikhtibar Tashfiyah) untuk studi S1 di Universitas Al-Azhar Kairo.',
                'event_date' => null,
                'location' => null,
                'registration_link' => 'https://diktis.kemenag.go.id/timteng',
                'status' => 'published',
                'published_at' => now()->subDays(3),
            ],
            [
                'type' => 'pengumuman',
                'title' => 'Nasihat Pengasuh: Menjaga Sanad Ilmu, Akhlaqul Karimah, dan Kemandirian Santri',
                'slug' => Str::slug('Nasihat Pengasuh: Menjaga Sanad Ilmu, Akhlaqul Karimah, dan Kemandirian Santri'),
                'content' => 'Pengasuh berpesan kepada seluruh santri yang sedang bertugas di medan pengabdian maupun di perguruan tinggi untuk senantiasa mendahulukan adab sebelum ilmu, menjaga nama baik almamater pesantren, serta tidak meninggalkan wirid dan shalat berjamaah.',
                'event_date' => null,
                'location' => null,
                'registration_link' => null,
                'status' => 'published',
                'published_at' => now()->subDay(),
            ],
        ];

        foreach ($posts as $post) {
            Berita::create([
                ...$post,
                'author_id' => $admin->id,
            ]);
        }
    }
}
