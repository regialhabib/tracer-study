<?php

namespace App\Services\Admin;

use App\Enums\KuesionerStatus;
use App\Enums\MetricKey;
use App\Enums\QuestionType;
use App\Enums\ResponStatus;
use App\Models\Kuesioner;
use App\Models\Pertanyaan;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Logika bisnis builder kuesioner admin (PRD KSN-01–08): CRUD meta, pertanyaan, urutan,
 * kunci struktur, status, dan duplikasi.
 */
class KuesionerBuilderService
{
    /**
     * Daftar kuesioner terbaru dahulu beserta hitungan pertanyaan & respon terkirim.
     */
    public function paginate(int $perPage = 25): LengthAwarePaginator
    {
        return Kuesioner::query()
            ->withCount([
                'pertanyaan',
                'respon as submitted_count' => fn ($query) => $query->where('status', ResponStatus::Submitted->value),
            ])
            ->withExists('jawaban as has_answers')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * @param  array{title: string, description?: ?string, start_date: string, end_date: string, target_graduation_years?: ?list<int|string>}  $data
     */
    public function create(array $data): Kuesioner
    {
        return Kuesioner::create([
            ...$this->metaAttributes($data),
            'status' => KuesionerStatus::Draft,
        ]);
    }

    /**
     * @param  array{title: string, description?: ?string, start_date: string, end_date: string, target_graduation_years?: ?list<int|string>}  $data
     */
    public function update(Kuesioner $kuesioner, array $data): Kuesioner
    {
        $attributes = $this->metaAttributes($data);

        if ($kuesioner->status === KuesionerStatus::Active) {
            $this->ensureNoOverlappingActive($kuesioner, $attributes['target_graduation_years']);
        }

        $kuesioner->update($attributes);

        return $kuesioner;
    }

    /**
     * Hanya kuesioner draf yang belum punya jawaban yang boleh dihapus.
     */
    public function delete(Kuesioner $kuesioner): void
    {
        if ($kuesioner->status !== KuesionerStatus::Draft || $kuesioner->isStructureLocked()) {
            $this->fail('destroy', 'Hanya kuesioner berstatus draf dan belum memiliki jawaban yang dapat dihapus.');
        }

        DB::transaction(function () use ($kuesioner): void {
            $kuesioner->respon()->delete();
            $kuesioner->pertanyaan()->delete();
            $kuesioner->delete();
        });
    }

    /**
     * Salin meta dan seluruh pertanyaan ke kuesioner draf baru; `depends_on` dipetakan ulang.
     */
    public function duplicate(Kuesioner $kuesioner): Kuesioner
    {
        return DB::transaction(function () use ($kuesioner): Kuesioner {
            $copy = Kuesioner::create([
                'title' => Str::limit($kuesioner->title, 240, '').' (Salinan)',
                'description' => $kuesioner->description,
                'target_graduation_years' => $kuesioner->target_graduation_years,
                'start_date' => $kuesioner->start_date,
                'end_date' => $kuesioner->end_date,
                'status' => KuesionerStatus::Draft,
            ]);

            $idMap = [];
            $copies = [];

            foreach ($kuesioner->pertanyaan()->get() as $question) {
                $new = $copy->pertanyaan()->create($question->only([
                    'section', 'question_text', 'help_text', 'question_type', 'options',
                    'metric_key', 'is_required', 'order', 'conditional_rule',
                ]));
                $idMap[$question->id] = $new->id;
                $copies[] = $new;
            }

            foreach ($copies as $new) {
                $rule = $new->conditional_rule;

                if ($rule !== null) {
                    $rule['depends_on'] = $idMap[$rule['depends_on'] ?? 0] ?? null;
                    $new->update(['conditional_rule' => $rule['depends_on'] === null ? null : $rule]);
                }
            }

            return $copy;
        });
    }

    public function changeStatus(Kuesioner $kuesioner, KuesionerStatus $target): Kuesioner
    {
        if (! in_array($target, $kuesioner->status->allowedTransitions(), true)) {
            $this->fail('status', "Status tidak dapat diubah dari {$kuesioner->status->label()} ke {$target->label()}.");
        }

        if ($target === KuesionerStatus::Active) {
            if (! $kuesioner->pertanyaan()->exists()) {
                $this->fail('status', 'Tambahkan minimal satu pertanyaan sebelum mengaktifkan kuesioner.');
            }

            $this->ensureNoOverlappingActive($kuesioner, $kuesioner->target_graduation_years);
        }

        $kuesioner->update(['status' => $target]);

        return $kuesioner;
    }

    /**
     * Tambah pertanyaan di akhir bagiannya (bagian baru → di akhir kuesioner).
     *
     * @param  array<string, mixed>  $data
     */
    public function addQuestion(Kuesioner $kuesioner, array $data): Pertanyaan
    {
        $this->ensureStructureEditable($kuesioner);

        return DB::transaction(function () use ($kuesioner, $data): Pertanyaan {
            $all = $kuesioner->pertanyaan()->get();
            $section = $this->cleanSection((string) $data['section']);

            $lastIndex = $all->keys()->filter(fn (int $index): bool => $all[$index]->sectionName() === $section)->last();
            $position = $lastIndex === null ? $all->count() : $lastIndex + 1;

            $attributes = $this->structuralAttributes($kuesioner, $all->slice(0, $position), $all, $data, null);

            $question = $kuesioner->pertanyaan()->create([
                ...$attributes,
                'question_text' => trim((string) $data['question_text']),
                'help_text' => $this->nullableText($data['help_text'] ?? null),
                'section' => $section,
                'order' => $position + 1,
            ]);

            $ids = $all->pluck('id')->all();
            array_splice($ids, $position, 0, [$question->id]);
            $this->applyOrder($ids);

            return $question->refresh();
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateQuestion(Kuesioner $kuesioner, Pertanyaan $question, array $data): Pertanyaan
    {
        return DB::transaction(function () use ($kuesioner, $question, $data): Pertanyaan {
            $all = $kuesioner->pertanyaan()->get();
            $index = $all->search(fn (Pertanyaan $item): bool => $item->id === $question->id);
            $texts = [
                'question_text' => trim((string) $data['question_text']),
                'help_text' => $this->nullableText($data['help_text'] ?? null),
            ];

            if ($kuesioner->isStructureLocked()) {
                $question->update([...$texts, 'options' => $this->lockedOptions($question, $kuesioner, $all->slice(0, (int) $index), $data)]);

                return $question;
            }

            $attributes = $this->structuralAttributes($kuesioner, $all->slice(0, (int) $index), $all, $data, $question);
            $question->update([...$texts, ...$attributes]);

            return $question;
        });
    }

    public function deleteQuestion(Kuesioner $kuesioner, Pertanyaan $question): void
    {
        $this->ensureStructureEditable($kuesioner);

        DB::transaction(function () use ($kuesioner, $question): void {
            $dependent = $this->dependentsOf($kuesioner->pertanyaan()->get(), $question);

            if ($dependent->isNotEmpty()) {
                $this->fail('destroy', 'Pertanyaan ini menjadi acuan logika kondisional pertanyaan lain. Hapus logikanya terlebih dahulu.');
            }

            $question->delete();
            $this->applyOrder($kuesioner->pertanyaan()->pluck('id')->all());
        });
    }

    /**
     * Terapkan urutan lengkap pertanyaan beserta bagiannya.
     *
     * @param  list<array{id: int|string, section: string}>  $items
     */
    public function reorder(Kuesioner $kuesioner, array $items): void
    {
        $this->ensureStructureEditable($kuesioner);

        DB::transaction(function () use ($kuesioner, $items): void {
            $all = $kuesioner->pertanyaan()->get()->keyBy('id');
            $incomingIds = collect($items)->pluck('id')->map(fn ($id): int => (int) $id)->sort()->values()->all();
            $existingIds = $all->keys()->sort()->values()->all();

            if ($incomingIds !== $existingIds) {
                $this->fail('items', 'Daftar pertanyaan sudah berubah. Muat ulang halaman lalu coba lagi.');
            }

            $grouped = [];

            foreach ($items as $item) {
                $grouped[$this->cleanSection((string) $item['section'])][] = (int) $item['id'];
            }

            $ordered = [];

            foreach ($grouped as $section => $ids) {
                foreach ($ids as $id) {
                    $ordered[] = ['id' => $id, 'section' => (string) $section];
                }
            }

            $positions = array_flip(array_column($ordered, 'id'));

            foreach ($all as $question) {
                $dependsOn = $question->conditional_rule['depends_on'] ?? null;

                if ($dependsOn !== null && ($positions[(int) $dependsOn] ?? PHP_INT_MAX) >= $positions[$question->id]) {
                    $this->fail('items', "Urutan ditolak: pertanyaan \"{$question->question_text}\" bergantung pada pertanyaan yang akan berada setelahnya. Pindahkan pertanyaan acuannya lebih dulu atau hapus logika kondisionalnya.");
                }
            }

            foreach ($ordered as $position => $entry) {
                $all[$entry['id']]->update(['section' => $entry['section'], 'order' => $position + 1]);
            }
        });
    }

    public function renameSection(Kuesioner $kuesioner, string $from, string $to): void
    {
        $from = $this->cleanSection($from);
        $to = $this->cleanSection($to);

        if ($from === $to) {
            return;
        }

        $all = $kuesioner->pertanyaan()->get();

        if (! $all->contains(fn (Pertanyaan $question): bool => $question->sectionName() === $from)) {
            $this->fail('from', 'Bagian yang akan diganti namanya tidak ditemukan.');
        }

        if ($all->contains(fn (Pertanyaan $question): bool => $question->sectionName() === $to)) {
            $this->fail('to', 'Nama bagian sudah dipakai bagian lain.');
        }

        $all->filter(fn (Pertanyaan $question): bool => $question->sectionName() === $from)
            ->each(fn (Pertanyaan $question) => $question->update(['section' => $to]));
    }

    /**
     * Atribut struktural pertanyaan (tipe, wajib, opsi, metric, kondisional) yang sudah divalidasi.
     *
     * @param  Collection<int, Pertanyaan>  $before  pertanyaan yang berada sebelum posisi ini
     * @param  Collection<int, Pertanyaan>  $all
     * @param  array<string, mixed>  $data
     * @return array{question_type: QuestionType, is_required: bool, options: ?list<array{value: string, label: string}>, metric_key: ?string, conditional_rule: ?array<string, mixed>}
     */
    private function structuralAttributes(Kuesioner $kuesioner, Collection $before, Collection $all, array $data, ?Pertanyaan $existing): array
    {
        $type = QuestionType::from((string) $data['question_type']);
        $metricKey = $this->resolveMetricKey($kuesioner, $type, $data['metric_key'] ?? null, $existing);
        $options = $type->hasOptions() ? $this->normalizeOptions($data['options'] ?? [], $metricKey?->presetOptions() !== null) : null;

        if ($metricKey?->presetOptions() !== null) {
            $options = $this->applyPreset($metricKey, $options);
        }

        $rule = $this->normalizeRule($data['conditional_rule'] ?? null, $before, $existing);

        if ($existing !== null) {
            $this->ensureDependentsStillValid($all, $existing, $type, $options);
        }

        return [
            'question_type' => $type,
            'is_required' => (bool) $data['is_required'],
            'options' => $options,
            'metric_key' => $metricKey?->value,
            'conditional_rule' => $rule,
        ];
    }

    /**
     * Saat terkunci: pastikan bagian struktural tidak berubah, hanya label opsi yang diperbarui.
     *
     * @param  Collection<int, Pertanyaan>  $before
     * @param  array<string, mixed>  $data
     * @return ?list<array{value: string, label: string}>
     */
    private function lockedOptions(Pertanyaan $question, Kuesioner $kuesioner, Collection $before, array $data): ?array
    {
        $message = 'Struktur terkunci karena sudah ada jawaban. Hanya teks pertanyaan, teks bantuan, dan label opsi yang dapat diubah.';
        $type = QuestionType::from((string) $data['question_type']);

        if ($type !== $question->question_type
            || (bool) $data['is_required'] !== $question->is_required
            || ($this->nullableText($data['metric_key'] ?? null)) !== $question->metric_key
            || json_encode($this->normalizeRule($data['conditional_rule'] ?? null, $before, $question, false)) !== json_encode($this->normalizeRule($question->conditional_rule, $before, $question, false))) {
            $this->fail('struktur', $message);
        }

        if (! $type->hasOptions()) {
            return null;
        }

        $incoming = $this->normalizeOptions($data['options'] ?? []);

        if (array_column($incoming, 'value') !== $question->optionValues()) {
            $this->fail('struktur', $message);
        }

        return $incoming;
    }

    private function resolveMetricKey(Kuesioner $kuesioner, QuestionType $type, mixed $value, ?Pertanyaan $existing): ?MetricKey
    {
        if ($value === null || $value === '') {
            return null;
        }

        $metricKey = MetricKey::from((string) $value);

        if ($metricKey->questionType() !== $type) {
            $this->fail('metric_key', "Kunci metrik \"{$metricKey->label()}\" hanya dapat dipakai pada tipe {$metricKey->questionType()->label()}.");
        }

        $taken = $kuesioner->pertanyaan()
            ->where('metric_key', $metricKey->value)
            ->when($existing !== null, fn ($query) => $query->whereKeyNot($existing->id))
            ->exists();

        if ($taken) {
            $this->fail('metric_key', "Kunci metrik \"{$metricKey->label()}\" sudah dipakai pertanyaan lain di kuesioner ini.");
        }

        return $metricKey;
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function normalizeOptions(mixed $options, bool $allowEmpty = false): array
    {
        if ($allowEmpty && empty($options)) {
            return [];
        }

        $normalized = [];
        $seen = [];

        foreach (array_values((array) $options) as $index => $option) {
            $label = trim((string) ($option['label'] ?? ''));
            $value = trim((string) ($option['value'] ?? ''));

            if ($label === '') {
                $this->fail('options', 'Label setiap opsi wajib diisi.');
            }

            if ($value === '') {
                $value = Str::slug($label, '_') ?: 'opsi_'.($index + 1);
            }

            if (isset($seen[$value])) {
                $this->fail('options', "Opsi \"{$label}\" duplikat. Setiap opsi harus memiliki label dan nilai yang berbeda.");
            }

            $seen[$value] = true;
            $normalized[] = ['value' => $value, 'label' => $label];
        }

        if (count($normalized) < 2) {
            $this->fail('options', 'Pertanyaan berpilihan memerlukan minimal 2 opsi.');
        }

        return $normalized;
    }

    /**
     * @param  ?list<array{value: string, label: string}>  $incoming
     * @return list<array{value: string, label: string}>
     */
    private function applyPreset(MetricKey $metricKey, ?array $incoming): array
    {
        $preset = $metricKey->presetOptions();

        if ($incoming === null || $incoming === []) {
            return $preset;
        }

        $labels = array_column($incoming, 'label', 'value');

        if (array_keys($labels) !== array_column($preset, 'value')) {
            $this->fail('options', "Opsi untuk kunci metrik \"{$metricKey->label()}\" bersifat baku. Anda hanya dapat mengubah labelnya.");
        }

        return array_map(fn (array $option): array => ['value' => $option['value'], 'label' => $labels[$option['value']]], $preset);
    }

    /**
     * @param  Collection<int, Pertanyaan>  $before
     * @return ?array{depends_on: int, operator: string, value: string|list<string>}
     */
    private function normalizeRule(mixed $rule, Collection $before, ?Pertanyaan $existing, bool $strict = true): ?array
    {
        if (! is_array($rule) || ! isset($rule['depends_on'])) {
            return null;
        }

        $dependsOn = (int) $rule['depends_on'];
        $reference = $before->firstWhere('id', $dependsOn);
        $operator = ($rule['operator'] ?? 'equals') === 'in' ? 'in' : 'equals';
        $values = array_values(array_map('strval', (array) ($rule['value'] ?? [])));

        if (! $strict) {
            return ['depends_on' => $dependsOn, 'operator' => $operator, 'value' => $operator === 'in' ? $values : ($values[0] ?? '')];
        }

        if ($reference === null || $dependsOn === $existing?->id) {
            $this->fail('conditional_rule', 'Pertanyaan acuan harus berada di kuesioner ini dan muncul sebelum pertanyaan ini.');
        }

        if (! $reference->question_type->hasOptions()) {
            $this->fail('conditional_rule', 'Pertanyaan acuan harus bertipe pilihan tunggal, pilihan ganda, atau dropdown.');
        }

        if ($values === [] || ($operator === 'equals' && count($values) !== 1)) {
            $this->fail('conditional_rule', $operator === 'equals' ? 'Pilih satu nilai kondisi.' : 'Pilih minimal satu nilai kondisi.');
        }

        if (array_diff($values, $reference->optionValues()) !== []) {
            $this->fail('conditional_rule', 'Nilai kondisi harus termasuk salah satu opsi pertanyaan acuan.');
        }

        return ['depends_on' => $dependsOn, 'operator' => $operator, 'value' => $operator === 'in' ? $values : $values[0]];
    }

    /**
     * Pertanyaan yang aturannya menunjuk ke pertanyaan ini tidak boleh menjadi rusak oleh perubahan tipe/opsi.
     *
     * @param  Collection<int, Pertanyaan>  $all
     * @param  ?list<array{value: string, label: string}>  $options
     */
    private function ensureDependentsStillValid(Collection $all, Pertanyaan $existing, QuestionType $type, ?array $options): void
    {
        $values = array_column($options ?? [], 'value');

        foreach ($this->dependentsOf($all, $existing) as $dependent) {
            $expected = array_map('strval', (array) ($dependent->conditional_rule['value'] ?? []));

            if (! $type->hasOptions() || array_diff($expected, $values) !== []) {
                $this->fail('conditional_rule', "Perubahan ditolak: pertanyaan \"{$dependent->question_text}\" memakai pertanyaan ini sebagai acuan logika kondisional.");
            }
        }
    }

    /**
     * @param  Collection<int, Pertanyaan>  $all
     * @return Collection<int, Pertanyaan>
     */
    private function dependentsOf(Collection $all, Pertanyaan $question): Collection
    {
        return $all->filter(fn (Pertanyaan $item): bool => (int) ($item->conditional_rule['depends_on'] ?? 0) === $question->id);
    }

    private function ensureStructureEditable(Kuesioner $kuesioner): void
    {
        if ($kuesioner->isStructureLocked()) {
            $this->fail('struktur', 'Struktur terkunci karena sudah ada jawaban. Anda tidak dapat menambah, menghapus, atau mengatur ulang pertanyaan.');
        }
    }

    /**
     * @param  ?list<int|string>  $targets
     */
    private function ensureNoOverlappingActive(Kuesioner $kuesioner, ?array $targets): void
    {
        $conflict = Kuesioner::query()
            ->active()
            ->whereKeyNot($kuesioner->id)
            ->get()
            ->first(fn (Kuesioner $other): bool => $this->targetsOverlap($targets, $other->target_graduation_years));

        if ($conflict !== null) {
            $this->fail('status', "Kuesioner aktif \"{$conflict->title}\" sudah menargetkan angkatan yang sama. Tutup kuesioner tersebut atau ubah target angkatan terlebih dahulu.");
        }
    }

    /**
     * @param  ?list<int|string>  $a
     * @param  ?list<int|string>  $b
     */
    private function targetsOverlap(?array $a, ?array $b): bool
    {
        if (empty($a) || empty($b)) {
            return true;
        }

        return array_intersect(array_map('intval', $a), array_map('intval', $b)) !== [];
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function metaAttributes(array $data): array
    {
        $years = collect($data['target_graduation_years'] ?? [])->map(fn ($year): int => (int) $year)->unique()->sort()->values()->all();

        return [
            'title' => trim((string) $data['title']),
            'description' => $this->nullableText($data['description'] ?? null),
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'target_graduation_years' => $years === [] ? null : $years,
        ];
    }

    /**
     * @param  list<int|string>  $ids
     */
    private function applyOrder(array $ids): void
    {
        foreach (array_values($ids) as $index => $id) {
            Pertanyaan::query()->whereKey($id)->update(['order' => $index + 1]);
        }
    }

    private function cleanSection(string $section): string
    {
        $section = trim($section);

        return $section === '' ? Pertanyaan::DEFAULT_SECTION : $section;
    }

    private function nullableText(mixed $value): ?string
    {
        $text = trim((string) $value);

        return $text === '' ? null : $text;
    }

    private function fail(string $key, string $message): never
    {
        throw ValidationException::withMessages([$key => $message]);
    }
}
