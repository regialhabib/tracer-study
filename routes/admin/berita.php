<?php

/*
|--------------------------------------------------------------------------
| Kelola Berita & Agenda (Fase 4, PRD BRT-01 s.d. BRT-05)
|--------------------------------------------------------------------------
|
| Prefix "/admin", nama "admin." (lihat routes/admin.php).
|
*/

use App\Http\Controllers\Admin\BeritaController;
use Illuminate\Support\Facades\Route;

Route::resource('berita', BeritaController::class)
    ->except('show')
    ->parameters(['berita' => 'berita']);
