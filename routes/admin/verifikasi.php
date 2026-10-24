<?php

/*
|--------------------------------------------------------------------------
| Modul Antrean Verifikasi Pendaftar Mandiri — ALM-07, AUTH-03
|--------------------------------------------------------------------------
|
| URL: /admin/verifikasi/...  ·  Nama: admin.verifikasi.*
|
*/

use App\Http\Controllers\Admin\VerifikasiController;
use Illuminate\Support\Facades\Route;

Route::prefix('verifikasi')->name('verifikasi.')->group(function () {
    Route::get('/', [VerifikasiController::class, 'index'])->name('index');
    Route::post('{user}/approve', [VerifikasiController::class, 'approve'])->name('approve');
    Route::post('{user}/reject', [VerifikasiController::class, 'reject'])->name('reject');
});
