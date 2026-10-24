<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Kuesioner\SavePertanyaanRequest;
use App\Http\Requests\Admin\Kuesioner\UpdateBagianRequest;
use App\Http\Requests\Admin\Kuesioner\UpdateUrutanRequest;
use App\Models\Kuesioner;
use App\Models\Pertanyaan;
use App\Services\Admin\KuesionerBuilderService;
use Illuminate\Http\RedirectResponse;

class PertanyaanController extends Controller
{
    public function __construct(private KuesionerBuilderService $builder) {}

    public function store(SavePertanyaanRequest $request, Kuesioner $kuesioner): RedirectResponse
    {
        $question = $this->builder->addQuestion($kuesioner, $request->validated());

        return to_route('admin.kuesioner.edit', $kuesioner)
            ->with('new_question_id', $question->id);
    }

    public function update(SavePertanyaanRequest $request, Kuesioner $kuesioner, Pertanyaan $pertanyaan): RedirectResponse
    {
        $this->ensureBelongs($kuesioner, $pertanyaan);
        $this->builder->updateQuestion($kuesioner, $pertanyaan, $request->validated());

        return back()->with('status', 'Pertanyaan berhasil disimpan.');
    }

    public function destroy(Kuesioner $kuesioner, Pertanyaan $pertanyaan): RedirectResponse
    {
        $this->ensureBelongs($kuesioner, $pertanyaan);
        $this->builder->deleteQuestion($kuesioner, $pertanyaan);

        return back()->with('status', 'Pertanyaan berhasil dihapus.');
    }

    public function urutan(UpdateUrutanRequest $request, Kuesioner $kuesioner): RedirectResponse
    {
        $this->builder->reorder($kuesioner, $request->validated('items'));

        return back();
    }

    public function bagian(UpdateBagianRequest $request, Kuesioner $kuesioner): RedirectResponse
    {
        $this->builder->renameSection($kuesioner, $request->validated('from'), $request->validated('to'));

        return back()->with('status', 'Nama bagian berhasil diubah.');
    }

    private function ensureBelongs(Kuesioner $kuesioner, Pertanyaan $pertanyaan): void
    {
        abort_unless($pertanyaan->kuesioner_id === $kuesioner->id, 404);
    }
}
