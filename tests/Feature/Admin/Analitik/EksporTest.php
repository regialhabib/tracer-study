<?php

namespace Tests\Feature\Admin\Analitik;

use App\Enums\QuestionType;
use App\Models\AlumniProfile;
use App\Models\JawabanKuesioner;
use App\Models\Kuesioner;
use App\Models\Pertanyaan;
use App\Models\ResponKuesioner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use OpenSpout\Reader\XLSX\Reader;
use Tests\TestCase;

class EksporTest extends TestCase
{
    use RefreshDatabase;

    private const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    private User $admin;

    private Kuesioner $kuesioner;

    private Pertanyaan $radio;

    private Pertanyaan $checkbox;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();

        $this->admin = User::factory()->admin()->create();
        $this->kuesioner = Kuesioner::factory()->forAllGraduationYears()->create(['title' => 'Tracer Study 2026']);
        $this->radio = Pertanyaan::factory()->create(['kuesioner_id' => $this->kuesioner->id, 'order' => 1]);
        $this->checkbox = Pertanyaan::factory()->type(QuestionType::Checkbox)->create(['kuesioner_id' => $this->kuesioner->id, 'order' => 2]);
    }

    private function makeAlumni(string $name, int $angkatan, ?string $submitted = null): User
    {
        $alumni = User::factory()->alumni()->create(['name' => $name]);
        AlumniProfile::factory()->create(['user_id' => $alumni->id, 'graduation_year' => $angkatan]);

        if ($submitted !== null) {
            $respon = ResponKuesioner::factory()->create([
                'kuesioner_id' => $this->kuesioner->id,
                'user_id' => $alumni->id,
                'status' => $submitted,
                'submitted_at' => $submitted === 'submitted' ? now() : null,
            ]);
            JawabanKuesioner::factory()->forRespon($respon)->create(['pertanyaan_id' => $this->radio->id, 'answer' => 'opsi_b']);
            JawabanKuesioner::factory()->forRespon($respon)->create(['pertanyaan_id' => $this->checkbox->id, 'answer' => json_encode(['opsi_a', 'opsi_c'])]);
        }

        return $alumni;
    }

    /**
     * @return list<list<mixed>>
     */
    private function readXlsx(string $content): array
    {
        $path = tempnam(sys_get_temp_dir(), 'ekspor').'.xlsx';
        file_put_contents($path, $content);

        $reader = new Reader;
        $reader->open($path);
        $rows = [];
        foreach ($reader->getSheetIterator() as $sheet) {
            foreach ($sheet->getRowIterator() as $row) {
                $rows[] = $row->toArray();
            }
        }
        $reader->close();
        unlink($path);

        return $rows;
    }

    public function test_jawaban_export_has_one_row_per_submitted_response_and_column_per_question(): void
    {
        $this->makeAlumni('Budi', 2023, 'submitted');
        $this->makeAlumni('Siti', 2024, 'submitted');
        $this->makeAlumni('Draf', 2024, 'draft');
        $this->makeAlumni('Kosong', 2024);

        $response = $this->actingAs($this->admin)->get(route('admin.analitik.ekspor.jawaban', ['kuesioner' => $this->kuesioner->id]));

        $response->assertOk();
        $this->assertStringContainsString(self::XLSX_TYPE, $response->headers->get('content-type'));
        $this->assertStringContainsString('jawaban-tracer-study-2026-'.now()->format('Ymd').'.xlsx', $response->headers->get('content-disposition'));

        $rows = $this->readXlsx($response->streamedContent());

        $this->assertCount(3, $rows);
        $this->assertCount(8, $rows[0]);
        $this->assertSame($this->radio->question_text, $rows[0][6]);
        $this->assertSame(['Budi', 'Siti'], [$rows[1][1], $rows[2][1]]);
        $this->assertSame('Opsi B', $rows[1][6]);
        $this->assertSame('Opsi A; Opsi C', $rows[1][7]);
    }

    public function test_jawaban_export_applies_angkatan_filter(): void
    {
        $this->makeAlumni('Budi', 2023, 'submitted');
        $this->makeAlumni('Siti', 2024, 'submitted');

        $response = $this->actingAs($this->admin)->get(route('admin.analitik.ekspor.jawaban', [
            'kuesioner' => $this->kuesioner->id,
            'angkatan' => [2024],
        ]));

        $rows = $this->readXlsx($response->streamedContent());

        $this->assertCount(2, $rows);
        $this->assertSame('Siti', $rows[1][1]);
    }

    public function test_belum_mengisi_export_lists_active_targets_without_submitted_response(): void
    {
        $this->makeAlumni('Budi', 2023, 'submitted');
        $this->makeAlumni('Draf', 2024, 'draft');
        $this->makeAlumni('Kosong', 2024);

        $response = $this->actingAs($this->admin)->get(route('admin.analitik.ekspor.belum-mengisi', ['kuesioner' => $this->kuesioner->id]));

        $response->assertOk();
        $this->assertStringContainsString(self::XLSX_TYPE, $response->headers->get('content-type'));
        $this->assertStringContainsString('belum-mengisi-tracer-study-2026-', $response->headers->get('content-disposition'));

        $rows = $this->readXlsx($response->streamedContent());

        $this->assertSame(['NISN', 'Nama', 'Angkatan', 'No. WA', 'Tautan WhatsApp'], $rows[0]);
        $names = array_column(array_slice($rows, 1), 1);
        sort($names);
        $this->assertSame(['Draf', 'Kosong'], $names);
    }

    public function test_laporan_pdf_is_generated(): void
    {
        $this->makeAlumni('Budi', 2023, 'submitted');

        $response = $this->actingAs($this->admin)->get(route('admin.analitik.ekspor.laporan', ['kuesioner' => $this->kuesioner->id]));

        $response->assertOk();
        $this->assertSame('application/pdf', $response->headers->get('content-type'));
        $this->assertStringContainsString('laporan-tracer-study-2026-'.now()->format('Ymd').'.pdf', $response->headers->get('content-disposition'));
        $this->assertStringStartsWith('%PDF', $response->getContent());
        $this->assertGreaterThan(1000, strlen($response->getContent()));
    }

    public function test_exports_redirect_back_with_error_when_no_questionnaire_exists(): void
    {
        Kuesioner::query()->delete();

        foreach (['jawaban', 'laporan', 'belum-mengisi'] as $name) {
            $this->actingAs($this->admin)
                ->from(route('admin.dashboard'))
                ->get(route('admin.analitik.ekspor.'.$name))
                ->assertRedirect(route('admin.dashboard'))
                ->assertSessionHas('error');
        }
    }

    public function test_alumni_cannot_access_exports(): void
    {
        $alumni = $this->makeAlumni('Budi', 2023);
        $this->actingAs($alumni);

        $this->get(route('admin.analitik.ekspor.jawaban'))->assertForbidden();
        $this->get(route('admin.analitik.ekspor.laporan'))->assertForbidden();
        $this->get(route('admin.analitik.ekspor.belum-mengisi'))->assertForbidden();
    }
}
