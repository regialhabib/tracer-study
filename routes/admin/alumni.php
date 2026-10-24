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

use Illuminate\Support\Facades\Route;

Route::prefix('alumni')->name('alumni.')->group(function () {
    //
});
