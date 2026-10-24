<?php

/*
|--------------------------------------------------------------------------
| Builder Kuesioner Admin — KSN-01–08
|--------------------------------------------------------------------------
|
| URL: /admin/kuesioner/...  ·  Nama: admin.kuesioner.*
|
*/

use App\Http\Controllers\Admin\KuesionerController;
use App\Http\Controllers\Admin\PertanyaanController;
use Illuminate\Support\Facades\Route;

Route::prefix('kuesioner')->name('kuesioner.')->group(function () {
    Route::get('/', [KuesionerController::class, 'index'])->name('index');
    Route::get('buat', [KuesionerController::class, 'create'])->name('create');
    Route::post('/', [KuesionerController::class, 'store'])->name('store');

    Route::group([], function () {
        Route::get('{kuesioner}/sunting', [KuesionerController::class, 'edit'])->name('edit');
        Route::put('{kuesioner}', [KuesionerController::class, 'update'])->name('update');
        Route::delete('{kuesioner}', [KuesionerController::class, 'destroy'])->name('destroy');
        Route::post('{kuesioner}/duplikat', [KuesionerController::class, 'duplicate'])->name('duplicate');
        Route::patch('{kuesioner}/status', [KuesionerController::class, 'status'])->name('status');
        Route::get('{kuesioner}/pratinjau', [KuesionerController::class, 'preview'])->name('preview');

        Route::post('{kuesioner}/pertanyaan', [PertanyaanController::class, 'store'])->name('pertanyaan.store');
        Route::patch('{kuesioner}/pertanyaan/urutan', [PertanyaanController::class, 'urutan'])->name('pertanyaan.urutan');
        Route::put('{kuesioner}/pertanyaan/{pertanyaan}', [PertanyaanController::class, 'update'])->name('pertanyaan.update');
        Route::delete('{kuesioner}/pertanyaan/{pertanyaan}', [PertanyaanController::class, 'destroy'])->name('pertanyaan.destroy');
        Route::patch('{kuesioner}/bagian', [PertanyaanController::class, 'bagian'])->name('bagian.update');
    });
});
