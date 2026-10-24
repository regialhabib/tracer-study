<?php

/*
|--------------------------------------------------------------------------
| Modul Import Alumni dari Excel/CSV — ALM-04/05/06
|--------------------------------------------------------------------------
|
| URL: /admin/alumni/import/...  ·  Nama: admin.alumni.import.*
| Dimuat sebelum routes/admin/alumni.php agar tidak tertangkap {alumni}.
|
*/

use App\Http\Controllers\Admin\ImportAlumniController;
use Illuminate\Support\Facades\Route;

Route::prefix('alumni/import')->name('alumni.import.')->controller(ImportAlumniController::class)->group(function () {
    Route::get('/', 'create')->name('create');
    Route::get('template', 'template')->name('template');
    Route::post('preview', 'preview')->name('preview');
    Route::post('confirm', 'store')->name('store');
    Route::get('report/{token}', 'report')->name('report');
});
