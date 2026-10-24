<?php

use App\Http\Controllers\Alumni\BerandaController;
use App\Http\Controllers\BeritaController;
use App\Http\Controllers\ProfileController;
use App\Models\Berita;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

Route::get('/', function () {
    $beritaTerbaru = Schema::hasTable('berita')
        ? Berita::published()->latest()->take(6)->get()
        : collect();

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'beritaTerbaru' => $beritaTerbaru,
    ]);
});

// Berita & Agenda Publik
Route::get('/berita', [BeritaController::class, 'index'])->name('berita.index');
Route::get('/berita/{berita:slug}', [BeritaController::class, 'show'])->name('berita.show');

// Area alumni (dan profil pengguna) — hanya akun aktif yang sudah menyelesaikan onboarding
Route::middleware(['auth', 'active', 'not_first_login'])->group(function () {
    Route::get('/dashboard', [BerandaController::class, 'index'])->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar.update');
    Route::delete('/profile/avatar', [ProfileController::class, 'destroyAvatar'])->name('profile.avatar.destroy');
    Route::patch('/profile/pesan', [ProfileController::class, 'updatePesan'])->name('profile.pesan.update');
});

// Notifikasi dalam aplikasi — admin & alumni
Route::middleware(['auth', 'active', 'not_first_login'])
    ->prefix('notifikasi')
    ->name('notifikasi.')
    ->group(base_path('routes/notifikasi.php'));

// Pesan pribadi — admin & alumni
Route::middleware(['auth', 'active', 'not_first_login'])
    ->prefix('pesan')
    ->name('pesan.')
    ->group(base_path('routes/pesan.php'));

// Pengisian kuesioner — khusus alumni
Route::middleware(['auth', 'active', 'not_first_login', 'role:alumni'])
    ->prefix('kuesioner')
    ->name('alumni.kuesioner.')
    ->group(base_path('routes/alumni/kuesioner.php'));

// Panel admin — rute per modul ada di routes/admin.php dan routes/admin/*.php
Route::middleware(['auth', 'active', 'not_first_login', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(base_path('routes/admin.php'));

require __DIR__.'/auth.php';
