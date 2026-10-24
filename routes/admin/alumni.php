<?php

/*
|--------------------------------------------------------------------------
| Modul Manajemen Alumni — ALM-01/02/03/08, AUTH-05 (reset password), ekspor
|--------------------------------------------------------------------------
|
| URL: /admin/alumni/...  ·  Nama: admin.alumni.*
| Dimuat terakhir dari routes/admin.php. Daftarkan rute statis (mis. export)
| sebelum rute ber-parameter {alumni}.
|
*/

use App\Http\Controllers\Admin\AlumniController;
use App\Http\Controllers\Admin\AlumniExportController;
use Illuminate\Support\Facades\Route;

Route::prefix('alumni')->name('alumni.')->group(function () {
    Route::get('/', [AlumniController::class, 'index'])->name('index');
    Route::get('/export', AlumniExportController::class)->name('export');
    Route::get('/create', [AlumniController::class, 'create'])->name('create');
    Route::post('/', [AlumniController::class, 'store'])->name('store');

    Route::get('/{alumni}', [AlumniController::class, 'show'])->whereNumber('alumni')->name('show');
    Route::get('/{alumni}/edit', [AlumniController::class, 'edit'])->whereNumber('alumni')->name('edit');
    Route::put('/{alumni}', [AlumniController::class, 'update'])->whereNumber('alumni')->name('update');
    Route::delete('/{alumni}', [AlumniController::class, 'destroy'])->whereNumber('alumni')->name('destroy');
    Route::patch('/{alumni}/status', [AlumniController::class, 'updateStatus'])->whereNumber('alumni')->name('status');
    Route::patch('/{alumni}/restore', [AlumniController::class, 'restore'])->whereNumber('alumni')->name('restore');
    Route::post('/{alumni}/reset-password', [AlumniController::class, 'resetPassword'])->whereNumber('alumni')->name('reset-password');
});
