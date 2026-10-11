<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\ProfileController;
use App\Models\Berita;
use App\Models\JawabanKuesioner;
use App\Models\Kuesioner;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

Route::get('/', function () {
    $beritaTerbaru = Schema::hasTable('berita')
        ? Berita::published()->latest()->take(3)->get()
        : collect();

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'beritaTerbaru' => $beritaTerbaru,
    ]);
});

// Dashboard alumni santri
Route::get('/dashboard', function (Request $request) {
    $user = $request->user();

    if ($user->isAdmin()) {
        return redirect()->route('admin.dashboard');
    }

    $activeKuesioner = Kuesioner::withCount('pertanyaan')->where('is_active', true)->first();
    $hasFilled = false;
    if ($activeKuesioner) {
        $hasFilled = JawabanKuesioner::where('kuesioner_id', $activeKuesioner->id)
            ->where('user_id', $user->id)
            ->exists();
    }

    $beritaList = Berita::published()->latest()->take(3)->get();

    return Inertia::render('Dashboard', [
        'activeKuesioner' => $activeKuesioner,
        'hasFilled' => $hasFilled,
        'beritaList' => $beritaList,
    ]);
})->middleware(['auth', 'not_first_login'])->name('dashboard');

// Rute khusus administrator
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
});

// Profil pengguna
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
