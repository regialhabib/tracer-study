<?php

namespace Tests\Feature\Admin\Import;

use App\Enums\AccountStatus;
use App\Models\AlumniProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Reader\XLSX\Reader;
use OpenSpout\Writer\XLSX\Writer;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AlumniImportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    private const HEADER = ['NISN', 'Nama', 'L/P', 'Tahun Masuk', 'Tahun Lulus', 'Peminatan', 'No. WA', 'Tanggal Lahir (DD-MM-YYYY)'];

    /**
     * @param  list<array<int, mixed>>  $dataRows
     * @param  list<string>|null  $header
     */
    private function makeXlsx(array $dataRows, ?array $header = self::HEADER, string $name = 'alumni.xlsx'): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'imp-').'.xlsx';
        $writer = new Writer;
        $writer->openToFile($path);

        if ($header !== null) {
            $writer->addRow(Row::fromValues($header));
        }
        foreach ($dataRows as $row) {
            $writer->addRow(Row::fromValues($row));
        }
        $writer->close();

        return new UploadedFile($path, $name, null, null, true);
    }

    /**
     * @return array<int, mixed>
     */
    private function validRow(string $nisn = '1234567890', string $birth = '17-08-2005'): array
    {
        return [$nisn, 'Ahmad Fulan', 'L', '2019', '2022', 'MIPA', '081234567890', $birth];
    }

    private function preview(User $admin, UploadedFile $file)
    {
        return $this->actingAs($admin)->post(route('admin.alumni.import.preview'), ['file' => $file]);
    }

    private function tokenFrom($response): string
    {
        return $response->viewData('page')['props']['preview']['token'];
    }

    #[Test]
    public function template_dapat_diunduh_dengan_header_dan_sheet_petunjuk(): void
    {
        $response = $this->actingAs(User::factory()->admin()->create())->get(route('admin.alumni.import.template'));

        $response->assertOk();
        $path = $response->baseResponse->getFile()->getPathname();

        $reader = new Reader;
        $reader->open($path);
        $sheetNames = [];
        $firstRow = null;
        foreach ($reader->getSheetIterator() as $sheet) {
            $sheetNames[] = $sheet->getName();
            if ($firstRow === null) {
                foreach ($sheet->getRowIterator() as $row) {
                    $firstRow = $row->toArray();
                    break;
                }
            }
        }
        $reader->close();

        $this->assertSame(['Data Alumni', 'Petunjuk'], $sheetNames);
        $this->assertSame(self::HEADER, $firstRow);
    }

    #[Test]
    public function halaman_import_dapat_dibuka_admin(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->get(route('admin.alumni.import.create'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/Alumni/Import')->where('step', 'upload'));
    }

    #[Test]
    public function pratinjau_menandai_baris_valid_dan_dilewati_dengan_alasan(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->alumni()->create(['nisn' => '1111111111']);
        $trashed = User::factory()->alumni()->create(['nisn' => '2222222222']);
        $trashed->delete();

        $file = $this->makeXlsx([
            $this->validRow('3333333333'),
            $this->validRow('3333333333'),
            $this->validRow('1111111111'),
            $this->validRow('2222222222'),
            ['12345', 'Pendek', 'L', '2019', '2022', 'MIPA', '', ''],
            ['4444444444', 'Salah JK', 'X', '2019', '2022', 'MIPA', '', ''],
            ['5555555555', 'Tahun Terbalik', 'P', '2023', '2020', 'MIPA', '', ''],
            ['6666666666', 'Tanggal Salah', 'P', '2019', '2022', 'MIPA', '', '31-02-2005'],
            ['7777777777', 'WA Salah', 'P', '2019', '2022', 'MIPA', 'abc', ''],
            ['8888888888', '', 'P', '2019', '2022', 'MIPA', '', ''],
            ['9999999999', 'Tanggal Slash', 'P', '2019', '2022', 'MIPA', '', '05/03/2004'],
        ]);

        $this->preview($admin, $file)->assertOk()->assertInertia(fn ($page) => $page
            ->where('step', 'preview')
            ->where('preview.summary', ['total' => 11, 'valid' => 2, 'dilewati' => 9])
            ->where('preview.rows.0.status', 'valid')
            ->where('preview.rows.1.reason', 'NISN duplikat dalam berkas (sama dengan baris 2).')
            ->where('preview.rows.2.reason', 'NISN sudah terdaftar di sistem.')
            ->where('preview.rows.3.reason', 'NISN sudah terdaftar di sistem.')
            ->where('preview.rows.4.reason', 'NISN harus berupa 10 digit angka.')
            ->where('preview.rows.5.reason', 'Kolom L/P harus diisi L atau P.')
            ->where('preview.rows.6.reason', 'Tahun Masuk tidak boleh lebih besar dari Tahun Lulus.')
            ->where('preview.rows.7.status', 'dilewati')
            ->where('preview.rows.8.status', 'dilewati')
            ->where('preview.rows.9.reason', 'Nama wajib diisi.')
            ->where('preview.rows.10.birth_date', '2004-03-05'));
    }

    #[Test]
    public function konfirmasi_menyimpan_baris_valid_dengan_kata_sandi_awal_dan_first_login(): void
    {
        $admin = User::factory()->admin()->create();
        $file = $this->makeXlsx([
            $this->validRow('3333333333', '17-08-2005'),
            ['4444444444', 'Tanpa Tanggal', 'P', '2018', '2021', 'IPS', '', ''],
            ['5555555555', 'Rusak', 'X', '2018', '2021', 'IPS', '', ''],
        ]);

        $token = $this->tokenFrom($this->preview($admin, $file));

        $this->actingAs($admin)
            ->post(route('admin.alumni.import.store'), ['token' => $token])
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('step', 'result')
                ->where('result.berhasil', 2)
                ->where('result.dilewati', 1)
                ->where('result.gagal', 0));

        $first = User::where('nisn', '3333333333')->firstOrFail();
        $this->assertTrue(Hash::check('17082005', $first->password));
        $this->assertTrue($first->first_login);
        $this->assertSame(AccountStatus::Active, $first->status);
        $this->assertSame('alumni', $first->role);
        $this->assertNull($first->email);
        $this->assertSame('mencari_kerja', $first->profile->current_status);
        $this->assertSame('2005-08-17', $first->profile->birth_date->toDateString());

        $second = User::where('nisn', '4444444444')->firstOrFail();
        $this->assertTrue(Hash::check('4444444444', $second->password));
        $this->assertDatabaseMissing('users', ['nisn' => '5555555555']);

        auth()->logout();

        $this->post('/login', ['login' => '3333333333', 'password' => '17082005']);

        $this->assertAuthenticatedAs($first);
    }

    #[Test]
    public function konfirmasi_dua_kali_tidak_menggandakan_data(): void
    {
        $admin = User::factory()->admin()->create();
        $token = $this->tokenFrom($this->preview($admin, $this->makeXlsx([$this->validRow()])));

        $this->actingAs($admin)->post(route('admin.alumni.import.store'), ['token' => $token])->assertOk();
        $this->actingAs($admin)->post(route('admin.alumni.import.store'), ['token' => $token])
            ->assertInertia(fn ($page) => $page->where('result.berhasil', 1));

        $this->assertSame(1, User::where('nisn', '1234567890')->count());
    }

    #[Test]
    public function nisn_yang_terdaftar_setelah_pratinjau_dilewati_saat_konfirmasi(): void
    {
        $admin = User::factory()->admin()->create();
        $token = $this->tokenFrom($this->preview($admin, $this->makeXlsx([$this->validRow()])));

        User::factory()->alumni()->create(['nisn' => '1234567890']);

        $this->actingAs($admin)->post(route('admin.alumni.import.store'), ['token' => $token])
            ->assertInertia(fn ($page) => $page->where('result.berhasil', 0)->where('result.dilewati', 1));
    }

    #[Test]
    public function kegagalan_penyimpanan_membatalkan_seluruh_transaksi(): void
    {
        $admin = User::factory()->admin()->create();
        $file = $this->makeXlsx([$this->validRow('3333333333'), $this->validRow('4444444444')]);
        $token = $this->tokenFrom($this->preview($admin, $file));

        AlumniProfile::creating(function (): void {
            if (AlumniProfile::count() >= 1) {
                throw new \RuntimeException('gagal sengaja');
            }
        });

        $this->actingAs($admin)->post(route('admin.alumni.import.store'), ['token' => $token])
            ->assertInertia(fn ($page) => $page->where('result.berhasil', 0)->where('result.gagal', 2));

        $this->assertDatabaseMissing('users', ['nisn' => '3333333333']);
        $this->assertDatabaseMissing('users', ['nisn' => '4444444444']);
        $this->assertSame(0, AlumniProfile::count());
    }

    #[Test]
    public function berkas_dengan_format_salah_ditolak(): void
    {
        $admin = User::factory()->admin()->create();

        $this->preview($admin, UploadedFile::fake()->create('alumni.pdf', 10, 'application/pdf'))
            ->assertSessionHasErrors('file');

        $this->preview($admin, UploadedFile::fake()->createWithContent('alumni.xlsx', 'bukan xlsx'))
            ->assertSessionHasErrors('file');

        $this->preview($admin, $this->makeXlsx([$this->validRow()], ['A', 'B']))
            ->assertSessionHasErrors('file');

        $this->preview($admin, $this->makeXlsx([]))
            ->assertSessionHasErrors('file');
    }

    #[Test]
    public function berkas_csv_diterima(): void
    {
        $admin = User::factory()->admin()->create();
        $csv = implode("\n", [
            implode(';', self::HEADER),
            '3333333333;Budi;L;2019;2022;MIPA;081234567890;17-08-2005',
        ]);

        $this->preview($admin, UploadedFile::fake()->createWithContent('alumni.csv', $csv))
            ->assertInertia(fn ($page) => $page->where('preview.summary.valid', 1));
    }

    #[Test]
    public function berkas_melebihi_batas_baris_ditolak(): void
    {
        $admin = User::factory()->admin()->create();
        $rows = array_fill(0, 2001, ['1234567890', 'A', 'L', '2019', '2022', 'MIPA', '', '']);

        $this->preview($admin, $this->makeXlsx($rows))->assertSessionHasErrors('file');
    }

    #[Test]
    public function token_milik_admin_lain_ditolak(): void
    {
        $owner = User::factory()->admin()->create();
        $other = User::factory()->admin()->create();
        $token = $this->tokenFrom($this->preview($owner, $this->makeXlsx([$this->validRow()])));

        $this->actingAs($other)->post(route('admin.alumni.import.store'), ['token' => $token])->assertForbidden();
        $this->actingAs($other)->get(route('admin.alumni.import.report', $token))->assertForbidden();
        $this->assertDatabaseMissing('users', ['nisn' => '1234567890']);
    }

    #[Test]
    public function token_kedaluwarsa_ditolak_dengan_pesan(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post(route('admin.alumni.import.store'), ['token' => Str::random(40)])
            ->assertSessionHasErrors('token');
    }

    #[Test]
    public function laporan_dapat_diunduh_setelah_konfirmasi(): void
    {
        $admin = User::factory()->admin()->create();
        $token = $this->tokenFrom($this->preview($admin, $this->makeXlsx([
            $this->validRow(),
            ['x', 'Rusak', 'L', '2019', '2022', 'MIPA', '', ''],
        ])));

        $this->actingAs($admin)->get(route('admin.alumni.import.report', $token))->assertNotFound();

        $this->actingAs($admin)->post(route('admin.alumni.import.store'), ['token' => $token]);

        $response = $this->actingAs($admin)->get(route('admin.alumni.import.report', $token));
        $response->assertOk();

        $reader = new Reader;
        $reader->open($response->baseResponse->getFile()->getPathname());
        $details = [];
        foreach ($reader->getSheetIterator() as $sheet) {
            if ($sheet->getName() === 'Rincian') {
                foreach ($sheet->getRowIterator() as $row) {
                    $details[] = $row->toArray();
                }
            }
        }
        $reader->close();

        $this->assertCount(3, $details);
        $this->assertSame('Berhasil', $details[1][3]);
        $this->assertSame('Dilewati', $details[2][3]);
    }

    #[Test]
    public function alumni_tidak_dapat_mengakses_import(): void
    {
        $alumni = User::factory()->alumni()->create();

        $this->actingAs($alumni)->get(route('admin.alumni.import.create'))->assertForbidden();
        $this->actingAs($alumni)->get(route('admin.alumni.import.template'))->assertForbidden();
        $this->actingAs($alumni)->post(route('admin.alumni.import.preview'))->assertForbidden();
        $this->actingAs($alumni)->post(route('admin.alumni.import.store'))->assertForbidden();
    }

    #[Test]
    public function lima_ratus_baris_divalidasi_dalam_batas_waktu(): void
    {
        $admin = User::factory()->admin()->create();
        $rows = [];
        for ($i = 0; $i < 500; $i++) {
            $rows[] = $this->validRow((string) (1000000000 + $i));
        }
        $file = $this->makeXlsx($rows);

        $start = microtime(true);
        $response = $this->preview($admin, $file);
        $previewSeconds = microtime(true) - $start;

        $this->assertLessThan(10, $previewSeconds);
        $response->assertInertia(fn ($page) => $page->where('preview.summary.valid', 500));
    }
}
