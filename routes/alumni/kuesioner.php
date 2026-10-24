<?php

/*
| Rute pengisian kuesioner alumni (Fase 2). Dimuat dari routes/web.php di dalam grup
| [auth, active, not_first_login, role:alumni], prefix "/kuesioner", nama "alumni.kuesioner.".
*/

use App\Http\Controllers\Alumni\KuesionerController;
use Illuminate\Support\Facades\Route;

Route::get('/', [KuesionerController::class, 'index'])->name('index');
Route::get('/{kuesioner}', [KuesionerController::class, 'show'])->name('show')->whereNumber('kuesioner');
Route::put('/{kuesioner}/draf', [KuesionerController::class, 'draft'])->name('draft')->whereNumber('kuesioner');
Route::get('/{kuesioner}/ringkasan', [KuesionerController::class, 'summary'])->name('summary')->whereNumber('kuesioner');
Route::post('/{kuesioner}/kirim', [KuesionerController::class, 'submit'])->name('submit')->whereNumber('kuesioner');
Route::get('/{kuesioner}/selesai', [KuesionerController::class, 'done'])->name('done')->whereNumber('kuesioner');
