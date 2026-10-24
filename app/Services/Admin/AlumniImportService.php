<?php

namespace App\Services\Admin;

use App\Enums\AccountStatus;
use App\Enums\AlumniStatus;
use App\Models\AlumniProfile;
use App\Models\User;
use App\Rules\WhatsAppNumber;
use App\Services\Support\InitialPasswordService;
use Carbon\CarbonImmutable;
use DateTimeInterface;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Common\Entity\Style\Style;
use OpenSpout\Reader\CSV\Options as CsvOptions;
use OpenSpout\Reader\CSV\Reader as CsvReader;
use OpenSpout\Reader\ReaderInterface;
use OpenSpout\Reader\XLSX\Options as XlsxOptions;
use OpenSpout\Reader\XLSX\Reader as XlsxReader;
use OpenSpout\Writer\XLSX\Writer;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Throwable;

class AlumniImportService
{
    public const MAX_ROWS = 2000;

    public const CACHE_MINUTES = 30;

    /**
     * Biaya bcrypt untuk kata sandi awal. Sengaja rendah agar ratusan akun tidak menahan permintaan;
     * kata sandi wajib diganti saat login pertama dan di-hash ulang dengan biaya penuh.
     */
    private const INITIAL_PASSWORD_ROUNDS = 8;

    private const CACHE_PREFIX = 'alumni-import:';

    private const SAMPLE_NISN = '0000000000';

    public function __construct(private InitialPasswordService $initialPassword) {}

    /**
     * Membaca berkas, memvalidasi tiap baris, dan menyimpan hasilnya di cache untuk admin tersebut.
     *
     * @return array{token: string, filename: string, summary: array{total: int, valid: int, dilewati: int}, rows: list<array<string, mixed>>}
     *
     * @throws ValidationException bila berkas tidak terbaca, formatnya salah, kosong, atau melebihi batas baris.
     */
    public function preview(UploadedFile $file, User $admin): array
    {
        $rawRows = $this->readRows($file);
        $rows = $this->validateRows($rawRows);

        $token = Str::random(40);
        $filename = $file->getClientOriginalName();

        Cache::put(self::CACHE_PREFIX.$token, [
            'admin_id' => $admin->id,
            'filename' => $filename,
            'rows' => $rows,
            'result' => null,
        ], now()->addMinutes(self::CACHE_MINUTES));

        return [
            'token' => $token,
            'filename' => $filename,
            'summary' => $this->summarize($rows),
            'rows' => $rows,
        ];
    }

    /**
     * Menyimpan baris valid dari pratinjau dalam satu transaksi database.
     *
     * Bila terjadi kegagalan, seluruh penyimpanan dibatalkan dan tidak ada akun yang terbentuk.
     *
     * @return array{token: string, berhasil: int, dilewati: int, gagal: int, errorMessage: ?string}
     */
    public function confirm(string $token, User $admin): array
    {
        $payload = $this->loadPayload($token, $admin);

        if ($payload['result'] !== null) {
            return $payload['result'];
        }

        /** @var list<array<string, mixed>> $rows */
        $rows = $payload['rows'];
        $validIndexes = array_keys(array_filter($rows, fn (array $row): bool => $row['status'] === 'valid'));

        $existing = $this->existingNisns(array_map(fn (int $index): string => $rows[$index]['nisn'], $validIndexes));

        foreach ($validIndexes as $index) {
            if (isset($existing[$rows[$index]['nisn']])) {
                $rows[$index]['status'] = 'dilewati';
                $rows[$index]['reason'] = 'NISN sudah terdaftar sejak pratinjau dibuat.';
            }
        }

        set_time_limit(300);

        $failureMessage = null;

        try {
            DB::transaction(function () use (&$rows): void {
                foreach ($rows as $index => $row) {
                    if ($row['status'] === 'valid') {
                        $this->createAlumni($row);
                        $rows[$index]['status'] = 'berhasil';
                    }
                }
            });
        } catch (Throwable $exception) {
            report($exception);
            $failureMessage = 'Penyimpanan dibatalkan karena terjadi kesalahan. Tidak ada data yang tersimpan; silakan coba lagi.';

            foreach ($rows as $index => $row) {
                if ($row['status'] === 'berhasil') {
                    $rows[$index]['status'] = 'valid';
                }
            }
        }

        if ($failureMessage !== null) {
            foreach ($rows as $index => $row) {
                if ($row['status'] === 'valid') {
                    $rows[$index]['status'] = 'gagal';
                    $rows[$index]['reason'] = 'Penyimpanan dibatalkan karena terjadi kesalahan.';
                }
            }
        }

        $counts = array_count_values(array_column($rows, 'status'));
        $result = [
            'token' => $token,
            'berhasil' => $counts['berhasil'] ?? 0,
            'dilewati' => $counts['dilewati'] ?? 0,
            'gagal' => $counts['gagal'] ?? 0,
            'errorMessage' => $failureMessage,
        ];

        $payload['rows'] = $rows;
        $payload['result'] = $failureMessage === null ? $result : null;
        Cache::put(self::CACHE_PREFIX.$token, $payload, now()->addMinutes(self::CACHE_MINUTES));

        return $result;
    }

    /**
     * Membuat laporan xlsx (ringkasan + rincian per baris) dan mengembalikan path berkas sementara.
     */
    public function buildReport(string $token, User $admin): string
    {
        $payload = $this->loadPayload($token, $admin);
        abort_if($payload['result'] === null, 404);

        $labels = ['berhasil' => 'Berhasil', 'dilewati' => 'Dilewati', 'gagal' => 'Gagal'];
        $result = $payload['result'];

        $path = tempnam(sys_get_temp_dir(), 'lap-alumni-').'.xlsx';
        $writer = new Writer;
        $writer->openToFile($path);
        $writer->getCurrentSheet()->setName('Ringkasan');

        $bold = new Style(fontBold: true);
        $writer->addRow(Row::fromValuesWithStyle(['Laporan Import Alumni'], $bold));
        $writer->addRow(Row::fromValues(['Berkas', $payload['filename']]));
        $writer->addRow(Row::fromValues(['Berhasil', $result['berhasil']]));
        $writer->addRow(Row::fromValues(['Dilewati', $result['dilewati']]));
        $writer->addRow(Row::fromValues(['Gagal', $result['gagal']]));

        $writer->addNewSheetAndMakeItCurrent()->setName('Rincian');
        $writer->addRow(Row::fromValuesWithStyle(['Baris', 'NISN', 'Nama', 'Hasil', 'Keterangan'], $bold));
        foreach ($payload['rows'] as $row) {
            $writer->addRow(Row::fromValues([
                $row['row'],
                (string) $row['nisn'],
                (string) $row['name'],
                $labels[$row['status']] ?? $row['status'],
                (string) ($row['reason'] ?? ''),
            ]));
        }

        $writer->close();

        return $path;
    }

    /**
     * Mengambil muatan cache dan memastikan token milik admin yang sedang login.
     *
     * @return array{admin_id: int, filename: string, rows: list<array<string, mixed>>, result: ?array<string, mixed>}
     */
    private function loadPayload(string $token, User $admin): array
    {
        $payload = Cache::get(self::CACHE_PREFIX.$token);

        if (! is_array($payload)) {
            throw ValidationException::withMessages([
                'token' => 'Sesi pratinjau sudah berakhir. Silakan unggah ulang berkas Anda.',
            ]);
        }

        abort_unless($payload['admin_id'] === $admin->id, 403);

        return $payload;
    }

    /**
     * Membuat satu akun alumni beserta profilnya.
     *
     * @param  array<string, mixed>  $row
     */
    private function createAlumni(array $row): void
    {
        $timestamp = now();

        $userId = DB::table('users')->insertGetId([
            'name' => $row['name'],
            'nisn' => $row['nisn'],
            'email' => null,
            'password' => Hash::driver('bcrypt')->make(
                $this->initialPassword->generate($row['birth_date'], $row['nisn']),
                ['rounds' => self::INITIAL_PASSWORD_ROUNDS],
            ),
            'role' => 'alumni',
            'status' => AccountStatus::Active->value,
            'first_login' => true,
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);

        AlumniProfile::create([
            'user_id' => $userId,
            'gender' => $row['gender'],
            'birth_date' => $row['birth_date'],
            'phone_number' => $row['phone'],
            'entry_year' => $row['entry_year'],
            'graduation_year' => $row['graduation_year'],
            'major' => $row['major'],
            'current_status' => AlumniStatus::MencariKerja->value,
        ]);
    }

    /**
     * Membaca baris data (tanpa kepala kolom) dari sheet pertama.
     *
     * @return list<array{row: int, cells: array<int, mixed>}>
     */
    private function readRows(UploadedFile $file): array
    {
        $reader = $this->makeReader($file);
        $rows = [];

        try {
            $reader->open($file->getRealPath());

            foreach ($reader->getSheetIterator() as $sheet) {
                $rowNumber = 0;

                foreach ($sheet->getRowIterator() as $row) {
                    $rowNumber++;
                    $cells = $row->toArray();

                    if ($rowNumber === 1) {
                        $this->assertHeader($cells);

                        continue;
                    }

                    if ($this->isBlank($cells)) {
                        continue;
                    }

                    if (count($rows) >= self::MAX_ROWS) {
                        throw ValidationException::withMessages([
                            'file' => 'Berkas memuat lebih dari '.number_format(self::MAX_ROWS, 0, ',', '.').' baris data. Pecah menjadi beberapa berkas.',
                        ]);
                    }

                    $rows[] = ['row' => $rowNumber, 'cells' => $cells];
                }

                break;
            }
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (Throwable $exception) {
            throw ValidationException::withMessages([
                'file' => 'Berkas tidak dapat dibaca. Pastikan berkas berformat .xlsx atau .csv yang valid.',
            ]);
        } finally {
            try {
                $reader->close();
            } catch (Throwable) {
                // Pembaca belum sempat terbuka.
            }
        }

        if ($rows === []) {
            throw ValidationException::withMessages(['file' => 'Berkas tidak memuat baris data. Isi data alumni mulai baris ke-2.']);
        }

        return $rows;
    }

    private function makeReader(UploadedFile $file): ReaderInterface
    {
        if (strtolower($file->getClientOriginalExtension()) === 'csv') {
            $firstLine = (string) strtok((string) file_get_contents($file->getRealPath(), false, null, 0, 4096), "\n");
            $delimiter = substr_count($firstLine, ';') > substr_count($firstLine, ',') ? ';' : ',';

            return new CsvReader(new CsvOptions(SHOULD_PRESERVE_EMPTY_ROWS: true, FIELD_DELIMITER: $delimiter));
        }

        return new XlsxReader(new XlsxOptions(SHOULD_PRESERVE_EMPTY_ROWS: true));
    }

    /**
     * @param  array<int, mixed>  $cells
     *
     * @throws ValidationException
     */
    private function assertHeader(array $cells): void
    {
        $normalize = fn (mixed $value): string => strtolower(preg_replace('/[^a-z0-9]/i', '', (string) $value));

        if ($normalize($cells[0] ?? '') !== 'nisn' || $normalize($cells[1] ?? '') !== 'nama') {
            throw ValidationException::withMessages([
                'file' => 'Kepala kolom tidak sesuai templat. Unduh templat terbaru dan isi mulai baris ke-2.',
            ]);
        }
    }

    /**
     * @param  array<int, mixed>  $cells
     */
    private function isBlank(array $cells): bool
    {
        foreach ($cells as $cell) {
            if ($cell instanceof DateTimeInterface || trim((string) $cell) !== '') {
                return false;
            }
        }

        return true;
    }

    /**
     * Memvalidasi setiap baris dan mengembalikan hasil siap simpan/tampil.
     *
     * @param  list<array{row: int, cells: array<int, mixed>}>  $rawRows
     * @return list<array<string, mixed>>
     */
    private function validateRows(array $rawRows): array
    {
        $parsed = array_map(fn (array $raw): array => $this->parseRow($raw['row'], $raw['cells']), $rawRows);

        $nisnCounts = array_count_values(array_filter(array_column($parsed, 'nisn'), fn (string $nisn): bool => $nisn !== ''));
        $existing = $this->existingNisns(array_keys($nisnCounts));
        $seen = [];

        foreach ($parsed as $index => $row) {
            $reason = $row['reason'];

            if ($reason === null && $row['nisn'] === self::SAMPLE_NISN) {
                $reason = 'Baris contoh dari templat. Hapus baris ini.';
            }

            if ($reason === null && isset($seen[$row['nisn']])) {
                $reason = 'NISN duplikat dalam berkas (sama dengan baris '.$seen[$row['nisn']].').';
            }

            if ($reason === null && isset($existing[$row['nisn']])) {
                $reason = 'NISN sudah terdaftar di sistem.';
            }

            if ($row['nisn'] !== '' && ! isset($seen[$row['nisn']])) {
                $seen[$row['nisn']] = $row['row'];
            }

            $parsed[$index]['reason'] = $reason;
            $parsed[$index]['status'] = $reason === null ? 'valid' : 'dilewati';
        }

        return $parsed;
    }

    /**
     * @param  array<int, mixed>  $cells
     * @return array<string, mixed>
     */
    private function parseRow(int $rowNumber, array $cells): array
    {
        $text = fn (int $position): string => $this->cellToString($cells[$position] ?? null);

        $nisn = $text(0);
        $name = $text(1);
        $gender = strtoupper($text(2));
        $entryYear = $text(3);
        $graduationYear = $text(4);
        $major = $text(5);
        $phone = $text(6);
        [$birthDate, $birthDateError] = $this->parseBirthDate($cells[7] ?? null);

        $reason = match (true) {
            $nisn === '' => 'NISN wajib diisi.',
            preg_match('/^\d{10}$/', $nisn) !== 1 => 'NISN harus berupa 10 digit angka.',
            $name === '' => 'Nama wajib diisi.',
            mb_strlen($name) > 255 => 'Nama maksimal 255 karakter.',
            ! in_array($gender, ['L', 'P'], true) => 'Kolom L/P harus diisi L atau P.',
            preg_match('/^\d{4}$/', $entryYear) !== 1 => 'Tahun Masuk harus 4 digit angka.',
            preg_match('/^\d{4}$/', $graduationYear) !== 1 => 'Tahun Lulus harus 4 digit angka.',
            (int) $entryYear > (int) $graduationYear => 'Tahun Masuk tidak boleh lebih besar dari Tahun Lulus.',
            $major === '' => 'Peminatan wajib diisi.',
            mb_strlen($major) > 100 => 'Peminatan maksimal 100 karakter.',
            $birthDateError !== null => $birthDateError,
            $phone !== '' && ! $this->isValidPhone($phone) => 'Nomor WhatsApp tidak valid. Gunakan format seperti 081234567890.',
            default => null,
        };

        return [
            'row' => $rowNumber,
            'status' => 'valid',
            'reason' => $reason,
            'nisn' => $nisn,
            'name' => $name,
            'gender' => $gender,
            'entry_year' => $entryYear === '' ? null : (int) $entryYear,
            'graduation_year' => $graduationYear === '' ? null : (int) $graduationYear,
            'major' => $major,
            'phone' => $phone === '' ? null : $phone,
            'birth_date' => $birthDate,
        ];
    }

    private function isValidPhone(string $phone): bool
    {
        $valid = true;
        (new WhatsAppNumber)->validate('phone', $phone, function () use (&$valid): void {
            $valid = false;
        });

        return $valid;
    }

    private function cellToString(mixed $value): string
    {
        return match (true) {
            $value === null => '',
            $value instanceof DateTimeInterface => $value->format('Y-m-d'),
            is_float($value) && floor($value) === $value => (string) (int) $value,
            default => trim((string) $value),
        };
    }

    /**
     * Menerima DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD, objek tanggal Excel, dan nomor seri Excel.
     *
     * @return array{0: ?string, 1: ?string} tanggal Y-m-d (atau null) dan pesan galat.
     */
    private function parseBirthDate(mixed $value): array
    {
        $invalid = [null, 'Tanggal Lahir tidak valid. Gunakan format DD-MM-YYYY, contoh 17-08-2004.'];

        if ($value === null || (is_string($value) && trim($value) === '')) {
            return [null, null];
        }

        $date = null;

        if ($value instanceof DateTimeInterface) {
            $date = CarbonImmutable::instance($value);
        } elseif (is_int($value) || is_float($value) || (is_string($value) && preg_match('/^\d{4,6}(\.\d+)?$/', trim($value)) === 1)) {
            $serial = (float) $value;
            $date = $serial >= 1 && $serial < 80000 ? CarbonImmutable::create(1899, 12, 30)->addDays((int) floor($serial)) : null;
        } elseif (is_string($value)) {
            $text = trim($value);

            if (preg_match('/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/', $text, $m) === 1 && checkdate((int) $m[2], (int) $m[1], (int) $m[3])) {
                $date = CarbonImmutable::create((int) $m[3], (int) $m[2], (int) $m[1]);
            } elseif (preg_match('/^(\d{4})-(\d{1,2})-(\d{1,2})$/', $text, $m) === 1 && checkdate((int) $m[2], (int) $m[3], (int) $m[1])) {
                $date = CarbonImmutable::create((int) $m[1], (int) $m[2], (int) $m[3]);
            }
        }

        if ($date === null || $date->year < 1900 || $date->isFuture()) {
            return $invalid;
        }

        return [$date->format('Y-m-d'), null];
    }

    /**
     * NISN yang sudah ada di database, termasuk akun yang dihapus lunak.
     *
     * @param  list<string>  $nisns
     * @return array<string, true>
     */
    private function existingNisns(array $nisns): array
    {
        $existing = [];

        foreach (array_chunk(array_unique($nisns), 500) as $chunk) {
            foreach (User::withTrashed()->whereIn('nisn', $chunk)->pluck('nisn') as $nisn) {
                $existing[(string) $nisn] = true;
            }
        }

        return $existing;
    }

    /**
     * @param  list<array<string, mixed>>  $rows
     * @return array{total: int, valid: int, dilewati: int}
     */
    private function summarize(array $rows): array
    {
        $valid = count(array_filter($rows, fn (array $row): bool => $row['status'] === 'valid'));

        return ['total' => count($rows), 'valid' => $valid, 'dilewati' => count($rows) - $valid];
    }
}
