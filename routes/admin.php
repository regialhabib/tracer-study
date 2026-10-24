<?php

/*
|--------------------------------------------------------------------------
| Rute Panel Admin
|--------------------------------------------------------------------------
|
| Dimuat dari routes/web.php di dalam grup middleware
| ['auth', 'active', 'not_first_login', 'role:admin'], prefix "/admin",
| dan nama rute "admin.". Setiap modul punya berkas sendiri di routes/admin/.
|
| Urutan require penting: modul dengan URL statis di bawah /admin/alumni/...
| (import) dimuat sebelum resource alumni agar tidak tertangkap {alumni}.
|
*/

use App\Http\Controllers\Admin\AdminDashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

require __DIR__.'/admin/import.php';
require __DIR__.'/admin/verifikasi.php';
require __DIR__.'/admin/pengguna.php';
require __DIR__.'/admin/alumni.php';
require __DIR__.'/admin/kuesioner.php';
require __DIR__.'/admin/analitik-ekspor.php';
require __DIR__.'/admin/analitik.php';
