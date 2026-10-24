<?php

/*
| Rute ekspor analitik (Fase 3): Excel jawaban mentah, laporan PDF, daftar belum mengisi.
| Dimuat dari routes/admin.php SEBELUM routes/admin/analitik.php.
*/

use App\Http\Controllers\Admin\AnalitikEksporController;
use Illuminate\Support\Facades\Route;

Route::prefix('analitik/ekspor')->name('analitik.ekspor.')->group(function () {
    Route::get('/jawaban', [AnalitikEksporController::class, 'jawaban'])->name('jawaban');
    Route::get('/laporan', [AnalitikEksporController::class, 'laporan'])->name('laporan');
    Route::get('/belum-mengisi', [AnalitikEksporController::class, 'belumMengisi'])->name('belum-mengisi');
});
