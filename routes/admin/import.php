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

use Illuminate\Support\Facades\Route;

Route::prefix('alumni/import')->name('alumni.import.')->group(function () {
    //
});
