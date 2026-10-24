<?php

/*
| Rute halaman analitik admin (Fase 3). Dimuat dari routes/admin.php.
*/

use App\Http\Controllers\Admin\AnalitikController;
use Illuminate\Support\Facades\Route;

Route::get('/analitik', [AnalitikController::class, 'index'])->name('analitik.index');
Route::get('/analitik/pertanyaan', [AnalitikController::class, 'pertanyaan'])->name('analitik.pertanyaan');
