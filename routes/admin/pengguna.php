<?php

/*
|--------------------------------------------------------------------------
| Modul Kelola Admin — AUTH-08
|--------------------------------------------------------------------------
|
| URL: /admin/pengguna/...  ·  Nama: admin.pengguna.*
|
*/

use App\Http\Controllers\Admin\AdminUserController;
use Illuminate\Support\Facades\Route;

Route::prefix('pengguna')->name('pengguna.')->group(function () {
    Route::get('/', [AdminUserController::class, 'index'])->name('index');
    Route::get('create', [AdminUserController::class, 'create'])->name('create');
    Route::post('/', [AdminUserController::class, 'store'])->name('store');
    Route::get('{adminUser}/edit', [AdminUserController::class, 'edit'])->name('edit');
    Route::put('{adminUser}', [AdminUserController::class, 'update'])->name('update');
    Route::patch('{adminUser}/deactivate', [AdminUserController::class, 'deactivate'])->name('deactivate');
    Route::patch('{adminUser}/activate', [AdminUserController::class, 'activate'])->name('activate');
});
