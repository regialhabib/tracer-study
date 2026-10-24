<?php

/*
|--------------------------------------------------------------------------
| Notifikasi Dalam Aplikasi (Fase 4, PRD NTF-02)
|--------------------------------------------------------------------------
|
| Dimuat dari routes/web.php di grup ['auth', 'active', 'not_first_login'],
| prefix "/notifikasi", nama "notifikasi.". Berlaku untuk admin & alumni.
|
*/

use App\Http\Controllers\NotifikasiController;
use Illuminate\Support\Facades\Route;

Route::get('/', [NotifikasiController::class, 'index'])->name('index');
Route::get('/terbaru', [NotifikasiController::class, 'recent'])->name('recent');
Route::post('/baca-semua', [NotifikasiController::class, 'markAllAsRead'])->name('read-all');
Route::post('/{notification}/baca', [NotifikasiController::class, 'markAsRead'])->name('read');
