<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Kode Negara Bawaan
    |--------------------------------------------------------------------------
    |
    | Dipakai untuk menormalkan nomor WhatsApp lokal (mis. 0812…) menjadi
    | format internasional tanpa tanda "+" (mis. 62812…) untuk tautan wa.me.
    |
    */

    'default_country_code' => '62',

    /*
    |--------------------------------------------------------------------------
    | Templat Pesan WhatsApp
    |--------------------------------------------------------------------------
    |
    | Teks awal untuk tautan https://wa.me/…?text=… yang dibuka admin.
    | Placeholder yang tersedia: :nama, :password_hint, :url.
    |
    */

    'whatsapp_templates' => [
        'akun_disetujui' => "Assalamu'alaikum, :nama. Alhamdulillah, akun Tracer Study Alumni PP Riyadhul Amien Anda telah diverifikasi oleh admin madrasah. Silakan masuk melalui :url untuk melengkapi data dan mengisi kuesioner. Jazakumullahu khairan.",

        'reset_password' => "Assalamu'alaikum, :nama. Kata sandi akun Tracer Study Alumni PP Riyadhul Amien Anda telah direset oleh admin madrasah. Silakan masuk melalui :url dengan NISN Anda dan kata sandi sementara :password_hint, lalu segera ganti kata sandi Anda. Jazakumullahu khairan.",

        'pengingat_kuesioner' => "Assalamu'alaikum, :nama. Kuesioner Tracer Study Alumni PP Riyadhul Amien sedang dibuka. Mohon kesediaan Anda meluangkan waktu sejenak untuk mengisinya melalui :url. Jawaban Anda sangat berarti bagi pengembangan madrasah. Jazakumullahu khairan.",
    ],

    /*
    |--------------------------------------------------------------------------
    | Teks Persetujuan Penggunaan Data (UU PDP No. 27/2022)
    |--------------------------------------------------------------------------
    |
    | Ditampilkan saat onboarding alumni (PRD keputusan #13). Status: DRAF,
    | perlu direview pihak madrasah sebelum dipakai resmi.
    |
    */

    'consent_text' => [
        'label' => 'Saya menyetujui penggunaan data pribadi saya untuk keperluan tracer study sesuai ketentuan berikut.',

        'summary' => 'Data Anda dipakai madrasah untuk tracer study, akreditasi, dan evaluasi pendidikan. Data pribadi hanya dapat dilihat admin madrasah, dan laporan hanya menampilkan angka gabungan tanpa identitas.',

        'points' => [
            'Tujuan: data dipakai untuk tracer study alumni, penyusunan laporan akreditasi, dan evaluasi mutu pendidikan di MA Pondok Pesantren Riyadhul Amien.',
            'Data yang dikumpulkan: identitas (nama, NISN, jenis kelamin, tanggal lahir, angkatan), kontak (email dan nomor WhatsApp), aktivitas pendidikan atau pekerjaan setelah lulus, serta rentang pendapatan.',
            'Akses data: data pribadi Anda hanya dapat dilihat oleh admin madrasah. Laporan yang dibagikan hanya berupa data agregat tanpa identitas perorangan.',
            'Pesan pribadi: isi pesan hanya dapat dibaca oleh kedua peserta percakapan. Admin tidak dapat membaca percakapan Anda dengan alumni lain.',
            'Hak Anda: Anda dapat memperbarui data kapan saja dan berhak meminta penghapusan akun beserta data pribadi Anda kepada admin madrasah.',
        ],
    ],

];
