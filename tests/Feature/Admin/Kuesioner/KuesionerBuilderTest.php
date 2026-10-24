<?php

namespace Tests\Feature\Admin\Kuesioner;

use App\Enums\KuesionerStatus;
use App\Enums\MetricKey;
use App\Enums\QuestionType;
use App\Models\JawabanKuesioner;
use App\Models\Kuesioner;
use App\Models\Pertanyaan;
use App\Models\ResponKuesioner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Arr;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class KuesionerBuilderTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        $this->admin = User::factory()->admin()->create();
    }

    /**
     * @return array<string, mixed>
     */
    private function questionPayload(array $overrides = []): array
    {
        return [
            'section' => 'Bagian Satu',
            'question_text' => 'Apa kegiatan Anda saat ini?',
            'help_text' => null,
            'question_type' => 'radio',
            'is_required' => true,
            'options' => [['label' => 'Bekerja Penuh'], ['label' => 'Kuliah']],
            ...$overrides,
        ];
    }

    private function lock(Kuesioner $kuesioner, Pertanyaan $question): void
    {
        $respon = ResponKuesioner::factory()->create(['kuesioner_id' => $kuesioner->id]);
        JawabanKuesioner::factory()->forRespon($respon)->create(['pertanyaan_id' => $question->id, 'answer' => 'opsi_a']);
    }

    public function test_alumni_dan_tamu_tidak_dapat_mengakses_builder(): void
    {
        $kuesioner = Kuesioner::factory()->draft()->create();

        $this->actingAs(User::factory()->alumni()->create())
            ->get(route('admin.kuesioner.index'))->assertForbidden();
        $this->actingAs(User::factory()->alumni()->create())
            ->post(route('admin.kuesioner.pertanyaan.store', $kuesioner), $this->questionPayload())->assertForbidden();
        $this->assertDatabaseCount('pertanyaan', 0);
    }

    public function test_index_menampilkan_hitungan_pertanyaan_dan_respon_terkirim(): void
    {
        $kuesioner = Kuesioner::factory()->create();
        Pertanyaan::factory()->count(2)->for($kuesioner, 'kuesioner')->create();
        ResponKuesioner::factory()->submitted()->create(['kuesioner_id' => $kuesioner->id]);
        ResponKuesioner::factory()->create(['kuesioner_id' => $kuesioner->id]);

        $this->actingAs($this->admin)
            ->get(route('admin.kuesioner.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Kuesioner/Index')
                ->where('kuesionerList.data.0.pertanyaan_count', 2)
                ->where('kuesionerList.data.0.submitted_count', 1));
    }

    public function test_membuat_kuesioner_berstatus_draf_lalu_redirect_ke_edit(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.kuesioner.store'), [
            'title' => 'Tracer 2026',
            'description' => 'Deskripsi',
            'start_date' => '2026-11-01',
            'end_date' => '2026-12-01',
            'target_graduation_years' => [2024, 2022],
        ]);

        $kuesioner = Kuesioner::firstOrFail();
        $response->assertRedirect(route('admin.kuesioner.edit', $kuesioner));
        $this->assertSame(KuesionerStatus::Draft, $kuesioner->status);
        $this->assertSame([2022, 2024], $kuesioner->target_graduation_years);
    }

    public function test_tanggal_tutup_tidak_boleh_sebelum_tanggal_buka(): void
    {
        $this->actingAs($this->admin)->post(route('admin.kuesioner.store'), [
            'title' => 'Tracer',
            'start_date' => '2026-12-01',
            'end_date' => '2026-11-01',
        ])->assertSessionHasErrors('end_date');

        $this->assertDatabaseCount('kuesioner', 0);
    }

    public function test_memperbarui_meta_kuesioner(): void
    {
        $kuesioner = Kuesioner::factory()->draft()->create();

        $this->actingAs($this->admin)->put(route('admin.kuesioner.update', $kuesioner), [
            'title' => 'Judul Baru',
            'start_date' => '2026-11-01',
            'end_date' => '2026-11-30',
            'target_graduation_years' => [],
        ])->assertSessionHasNoErrors();

        $kuesioner->refresh();
        $this->assertSame('Judul Baru', $kuesioner->title);
        $this->assertNull($kuesioner->target_graduation_years);
    }

    public function test_halaman_edit_membawa_props_builder(): void
    {
        $kuesioner = Kuesioner::factory()->draft()->create();
        Pertanyaan::factory()->for($kuesioner, 'kuesioner')->create();

        $this->actingAs($this->admin)
            ->get(route('admin.kuesioner.edit', $kuesioner))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Kuesioner/Edit')
                ->has('sections', 1)
                ->where('isStructureLocked', false)
                ->has('questionTypes', 8)
                ->has('metricKeys', 6));
    }

    public function test_menambah_pertanyaan_berpilihan_membuat_value_dari_label(): void
    {
        $kuesioner = Kuesioner::factory()->draft()->create();

        $this->actingAs($this->admin)
            ->post(route('admin.kuesioner.pertanyaan.store', $kuesioner), $this->questionPayload())
            ->assertRedirect(route('admin.kuesioner.edit', $kuesioner));

        $question = Pertanyaan::firstOrFail();
        $this->assertSame(['bekerja_penuh', 'kuliah'], $question->optionValues());
        $this->assertSame(1, $question->order);
    }

    public function test_pertanyaan_baru_ditempatkan_di_akhir_bagiannya(): void
    {
        $kuesioner = Kuesioner::factory()->draft()->create();
        $a = Pertanyaan::factory()->for($kuesioner, 'kuesioner')->create(['section' => 'A', 'order' => 1]);
        $b = Pertanyaan::factory()->for($kuesioner, 'kuesioner')->create(['section' => 'B', 'order' => 2]);

        $this->actingAs($this->admin)->post(route('admin.kuesioner.pertanyaan.store', $kuesioner), $this->questionPayload(['section' => 'A']));

        $ids = $kuesioner->pertanyaan()->pluck('id')->all();
        $this->assertSame($a->id, $ids[0]);
        $this->assertSame($b->id, $ids[2]);
    }

    public function test_opsi_kurang_dari_dua_atau_duplikat_ditolak_dan_tipe_lain_tanpa_opsi(): void
    {
        $kuesioner = Kuesioner::factory()->draft()->create();
        $url = route('admin.kuesioner.pertanyaan.store', $kuesioner);

        $this->actingAs($this->admin)->post($url, $this->questionPayload(['options' => [['label' => 'Satu']]]))
            ->assertSessionHasErrors('options');
        $this->post($url, $this->questionPayload(['options' => [['label' => 'Sama'], ['label' => 'sama']]]))
            ->assertSessionHasErrors('options');
        $this->assertDatabaseCount('pertanyaan', 0);

        $this->post($url, $this->questionPayload(['question_type' => 'text', 'options' => [['label' => 'A'], ['label' => 'B']]]))
            ->assertSessionHasNoErrors();
        $this->assertNull(Pertanyaan::firstOrFail()->options);
    }

    public function test_metric_key_harus_cocok_tipe_unik_dan_memakai_opsi_baku(): void
    {
        $kuesioner = Kuesioner::factory()->draft()->create();
        $url = route('admin.kuesioner.pertanyaan.store', $kuesioner);

        $this->actingAs($this->admin)->post($url, $this->questionPayload(['metric_key' => 'masa_tunggu_bulan']))
            ->assertSessionHasErrors('metric_key');

        $this->post($url, $this->questionPayload(['metric_key' => 'status_kegiatan', 'options' => null]))
            ->assertSessionHasNoErrors();
        $question = Pertanyaan::firstOrFail();
        $this->assertSame(MetricKey::StatusKegiatan->presetOptions(), $question->options);

        $this->post($url, $this->questionPayload(['metric_key' => 'status_kegiatan', 'options' => null]))
            ->assertSessionHasErrors('metric_key');

        $this->put(route('admin.kuesioner.pertanyaan.update', [$kuesioner, $question]), Arr::except($this->questionPayload([
            'metric_key' => 'status_kegiatan',
            'options' => [['value' => 'lain', 'label' => 'Lain'], ['value' => 'x', 'label' => 'X']],
        ]), 'section'))->assertSessionHasErrors('options');
    }

    public function test_logika_kondisional_harus_menunjuk_pertanyaan_berpilihan_sebelumnya(): void
    {
        $kuesioner = Kuesioner::factory()->draft()->create();
        $radio = Pertanyaan::factory()->for($kuesioner, 'kuesioner')->create(['order' => 1]);
        $text = Pertanyaan::factory()->for($kuesioner, 'kuesioner')->type(QuestionType::Text)->create(['order' => 2]);
        $url = route('admin.kuesioner.pertanyaan.store', $kuesioner);

        $this->actingAs($this->admin)->post($url, $this->questionPayload([
            'conditional_rule' => ['depends_on' => $text->id, 'operator' => 'equals', 'value' => 'x'],
        ]))->assertSessionHasErrors('conditional_rule');

        $this->post($url, $this->questionPayload([
            'conditional_rule' => ['depends_on' => $radio->id, 'operator' => 'equals', 'value' => 'tidak_ada'],
        ]))->assertSessionHasErrors('conditional_rule');

        $this->post($url, $this->questionPayload([
            'conditional_rule' => ['depends_on' => $radio->id, 'operator' => 'in', 'value' => ['opsi_a', 'opsi_b']],
        ]))->assertSessionHasNoErrors();

        $this->assertSame(3, Pertanyaan::count());
    }

    public function test_menghapus_pertanyaan_yang_menjadi_acuan_ditolak(): void
    {
        $kuesioner = Kuesioner::factory()->draft()->create();
        $radio = Pertanyaan::factory()->for($kuesioner, 'kuesioner')->create(['order' => 1]);
        Pertanyaan::factory()->for($kuesioner, 'kuesioner')->dependsOn($radio, 'opsi_a')->create(['order' => 2]);

        $this->actingAs($this->admin)
            ->delete(route('admin.kuesioner.pertanyaan.destroy', [$kuesioner, $radio]))
            ->assertSessionHasErrors('destroy');

        $this->assertDatabaseHas('pertanyaan', ['id' => $radio->id]);
    }

    public function test_reorder_antar_bagian_menyimpan_urutan_dan_bagian(): void
    {
        $kuesioner = Kuesioner::factory()->draft()->create();
        $a = Pertanyaan::factory()->for($kuesioner, 'kuesioner')->create(['section' => 'A', 'order' => 1]);
        $b = Pertanyaan::factory()->for($kuesioner, 'kuesioner')->create(['section' => 'A', 'order' => 2]);
        $c = Pertanyaan::factory()->for($kuesioner, 'kuesioner')->create(['section' => 'B', 'order' => 3]);

        $this->actingAs($this->admin)->patch(route('admin.kuesioner.pertanyaan.urutan', $kuesioner), [
            'items' => [
                ['id' => $c->id, 'section' => 'B'],
                ['id' => $a->id, 'section' => 'B'],
                ['id' => $b->id, 'section' => 'A'],
            ],
        ])->assertSessionHasNoErrors();

        $this->assertSame([$c->id, $a->id, $b->id], $kuesioner->pertanyaan()->pluck('id')->all());
        $this->assertSame('B', $a->refresh()->section);
    }

    public function test_reorder_yang_membuat_aturan_menunjuk_ke_depan_ditolak(): void
    {
        $kuesioner = Kuesioner::factory()->draft()->create();
        $radio = Pertanyaan::factory()->for($kuesioner, 'kuesioner')->create(['order' => 1]);
        $child = Pertanyaan::factory()->for($kuesioner, 'kuesioner')->dependsOn($radio, 'opsi_a')->create(['order' => 2]);

        $this->actingAs($this->admin)->patch(route('admin.kuesioner.pertanyaan.urutan', $kuesioner), [
            'items' => [
                ['id' => $child->id, 'section' => 'Aktivitas Saat Ini'],
                ['id' => $radio->id, 'section' => 'Aktivitas Saat Ini'],
            ],
        ])->assertSessionHasErrors('items');

        $this->assertSame([$radio->id, $child->id], $kuesioner->pertanyaan()->pluck('id')->all());
    }

    public function test_struktur_terkunci_menolak_hapus_ubah_tipe_dan_reorder_tetapi_teks_boleh(): void
    {
        $kuesioner = Kuesioner::factory()->create();
        $question = Pertanyaan::factory()->for($kuesioner, 'kuesioner')->create(['order' => 1]);
        $other = Pertanyaan::factory()->for($kuesioner, 'kuesioner')->create(['order' => 2]);
        $this->lock($kuesioner, $question);

        $this->actingAs($this->admin)
            ->delete(route('admin.kuesioner.pertanyaan.destroy', [$kuesioner, $question]))
            ->assertSessionHasErrors('struktur');
        $this->assertDatabaseHas('pertanyaan', ['id' => $question->id]);

        $this->post(route('admin.kuesioner.pertanyaan.store', $kuesioner), $this->questionPayload())
            ->assertSessionHasErrors('struktur');

        $this->patch(route('admin.kuesioner.pertanyaan.urutan', $kuesioner), [
            'items' => [['id' => $other->id, 'section' => 'Aktivitas Saat Ini'], ['id' => $question->id, 'section' => 'Aktivitas Saat Ini']],
        ])->assertSessionHasErrors('struktur');

        $update = route('admin.kuesioner.pertanyaan.update', [$kuesioner, $question]);
        $base = [
            'question_text' => 'Teks baru',
            'help_text' => 'Bantuan',
            'question_type' => 'radio',
            'is_required' => true,
            'options' => [['value' => 'opsi_a', 'label' => 'Label A'], ['value' => 'opsi_b', 'label' => 'B'], ['value' => 'opsi_c', 'label' => 'C']],
        ];

        $this->put($update, [...$base, 'question_type' => 'text'])->assertSessionHasErrors('struktur');
        $this->put($update, [...$base, 'options' => array_slice($base['options'], 0, 2)])->assertSessionHasErrors('struktur');
        $this->put($update, [...$base, 'is_required' => false])->assertSessionHasErrors('struktur');

        $this->put($update, $base)->assertSessionHasNoErrors();
        $question->refresh();
        $this->assertSame('Teks baru', $question->question_text);
        $this->assertSame('Label A', $question->optionLabel('opsi_a'));
    }

    public function test_ganti_nama_bagian_boleh_saat_terkunci_dan_menolak_nama_bentrok(): void
    {
        $kuesioner = Kuesioner::factory()->create();
        $a = Pertanyaan::factory()->for($kuesioner, 'kuesioner')->create(['section' => 'A', 'order' => 1]);
        Pertanyaan::factory()->for($kuesioner, 'kuesioner')->create(['section' => 'B', 'order' => 2]);
        $this->lock($kuesioner, $a);
        $url = route('admin.kuesioner.bagian.update', $kuesioner);

        $this->actingAs($this->admin)->patch($url, ['from' => 'A', 'to' => 'B'])->assertSessionHasErrors('to');
        $this->patch($url, ['from' => 'A', 'to' => 'Profil'])->assertSessionHasNoErrors();

        $this->assertSame('Profil', $a->refresh()->section);
    }

    public function test_transisi_status_mengikuti_aturan_dan_aktivasi_butuh_pertanyaan(): void
    {
        $kuesioner = Kuesioner::factory()->draft()->create();
        $url = route('admin.kuesioner.status', $kuesioner);

        $this->actingAs($this->admin)->patch($url, ['status' => 'closed'])->assertSessionHasErrors('status');
        $this->patch($url, ['status' => 'active'])->assertSessionHasErrors('status');

        Pertanyaan::factory()->for($kuesioner, 'kuesioner')->create();
        $this->patch($url, ['status' => 'active'])->assertSessionHasNoErrors();
        $this->assertSame(KuesionerStatus::Active, $kuesioner->refresh()->status);

        $this->patch($url, ['status' => 'closed'])->assertSessionHasNoErrors();
        $this->assertSame(KuesionerStatus::Closed, $kuesioner->refresh()->status);
    }

    public function test_dua_kuesioner_aktif_dengan_target_beririsan_ditolak(): void
    {
        Kuesioner::factory()->create(['target_graduation_years' => [2022, 2023]]);
        $beririsan = Kuesioner::factory()->draft()->create(['target_graduation_years' => [2023, 2025]]);
        $terpisah = Kuesioner::factory()->draft()->create(['target_graduation_years' => [2025]]);
        $semua = Kuesioner::factory()->draft()->forAllGraduationYears()->create();
        foreach ([$beririsan, $terpisah, $semua] as $item) {
            Pertanyaan::factory()->for($item, 'kuesioner')->create();
        }

        $this->actingAs($this->admin);
        $this->patch(route('admin.kuesioner.status', $beririsan), ['status' => 'active'])->assertSessionHasErrors('status');
        $this->patch(route('admin.kuesioner.status', $semua), ['status' => 'active'])->assertSessionHasErrors('status');
        $this->patch(route('admin.kuesioner.status', $terpisah), ['status' => 'active'])->assertSessionHasNoErrors();
    }

    public function test_hapus_hanya_untuk_draf_yang_belum_terkunci(): void
    {
        $active = Kuesioner::factory()->create();
        $draft = Kuesioner::factory()->draft()->create();
        $locked = Kuesioner::factory()->draft()->create();
        $this->lock($locked, Pertanyaan::factory()->for($locked, 'kuesioner')->create());

        $this->actingAs($this->admin);
        $this->delete(route('admin.kuesioner.destroy', $active))->assertSessionHasErrors('destroy');
        $this->delete(route('admin.kuesioner.destroy', $locked))->assertSessionHasErrors('destroy');
        $this->delete(route('admin.kuesioner.destroy', $draft))->assertRedirect(route('admin.kuesioner.index'));

        $this->assertDatabaseMissing('kuesioner', ['id' => $draft->id]);
        $this->assertDatabaseHas('kuesioner', ['id' => $locked->id]);
    }

    public function test_duplikasi_menyalin_pertanyaan_dan_memetakan_ulang_acuan(): void
    {
        $kuesioner = Kuesioner::factory()->create();
        $radio = Pertanyaan::factory()->for($kuesioner, 'kuesioner')->create(['order' => 1]);
        $child = Pertanyaan::factory()->for($kuesioner, 'kuesioner')->dependsOn($radio, 'opsi_a')->create(['order' => 2]);

        $this->actingAs($this->admin)->post(route('admin.kuesioner.duplicate', $kuesioner));

        $copy = Kuesioner::where('id', '!=', $kuesioner->id)->firstOrFail();
        $this->assertSame($kuesioner->title.' (Salinan)', $copy->title);
        $this->assertSame(KuesionerStatus::Draft, $copy->status);

        [$newRadio, $newChild] = $copy->pertanyaan()->get()->all();
        $this->assertNotSame($radio->id, $newRadio->id);
        $this->assertSame($newRadio->id, $newChild->conditional_rule['depends_on']);
        $this->assertSame($child->question_text, $newChild->question_text);
        $this->assertSame($radio->id, $child->refresh()->conditional_rule['depends_on']);
    }

    public function test_pratinjau_menampilkan_bagian_kuesioner(): void
    {
        $kuesioner = Kuesioner::factory()->draft()->create();
        Pertanyaan::factory()->for($kuesioner, 'kuesioner')->create();

        $this->actingAs($this->admin)
            ->get(route('admin.kuesioner.preview', $kuesioner))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Kuesioner/Preview')
                ->has('sections', 1)
                ->has('sections.0.questions', 1));
    }
}
