<?php

/*
|--------------------------------------------------------------------------
| Pesan Pribadi (Fase 5, PRD MSG-01 s.d. MSG-08)
|--------------------------------------------------------------------------
|
| Dimuat dari routes/web.php di grup ['auth', 'active', 'not_first_login'],
| prefix "/pesan", nama "pesan.". Berlaku untuk admin & alumni.
| Rute statis didaftarkan sebelum rute ber-{conversation}.
|
*/

use App\Http\Controllers\Pesan\BlokirController;
use App\Http\Controllers\Pesan\KontakController;
use App\Http\Controllers\Pesan\PesanController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PesanController::class, 'index'])->name('index');
Route::get('/cari', [KontakController::class, 'index'])->name('cari');
Route::post('/mulai/{user}', [PesanController::class, 'start'])->name('start');

Route::post('/blokir/{user}', [BlokirController::class, 'store'])->name('blokir.store');
Route::delete('/blokir/{user}', [BlokirController::class, 'destroy'])->name('blokir.destroy');

Route::whereNumber('conversation')->group(function () {
    Route::get('/{conversation}', [PesanController::class, 'show'])->name('show');
    Route::get('/{conversation}/riwayat', [PesanController::class, 'history'])->name('history');
    Route::post('/{conversation}/kirim', [PesanController::class, 'store'])
        ->middleware('throttle:pesan')
        ->name('store');
    Route::post('/{conversation}/baca', [PesanController::class, 'read'])->name('read');
});
