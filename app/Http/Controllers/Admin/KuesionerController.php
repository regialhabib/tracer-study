<?php

namespace App\Http\Controllers\Admin;

use App\Enums\KuesionerStatus;
use App\Enums\MetricKey;
use App\Enums\QuestionType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Kuesioner\SaveKuesionerRequest;
use App\Http\Requests\Admin\Kuesioner\UpdateStatusRequest;
use App\Models\Kuesioner;
use App\Services\Admin\KuesionerBuilderService;
use App\Services\Kuesioner\KuesionerPresenter;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class KuesionerController extends Controller
{
    public function __construct(
        private KuesionerBuilderService $builder,
        private KuesionerPresenter $presenter,
    ) {}

    public function index(): Response
    {
        $kuesioner = $this->builder->paginate();

        $kuesioner->through(fn (Kuesioner $item): array => [
            ...$this->presenter->kuesioner($item),
            'pertanyaan_count' => $item->pertanyaan_count,
            'submitted_count' => $item->submitted_count,
            'allowed_transitions' => array_map(
                fn (KuesionerStatus $status): array => ['value' => $status->value, 'label' => $status->label()],
                $item->status->allowedTransitions(),
            ),
            'can_delete' => $item->status === KuesionerStatus::Draft && ! $item->has_answers,
        ]);

        return Inertia::render('Admin/Kuesioner/Index', ['kuesionerList' => $kuesioner]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Kuesioner/Create');
    }

    public function store(SaveKuesionerRequest $request): RedirectResponse
    {
        $kuesioner = $this->builder->create($request->validated());

        return to_route('admin.kuesioner.edit', $kuesioner)
            ->with('status', 'Kuesioner berhasil dibuat sebagai draf. Tambahkan pertanyaan di bawah ini.');
    }

    public function edit(Kuesioner $kuesioner): Response
    {
        $questions = $kuesioner->pertanyaan()->get();

        return Inertia::render('Admin/Kuesioner/Edit', [
            'kuesioner' => $this->presenter->kuesioner($kuesioner),
            'sections' => $this->presenter->sections($questions),
            'isStructureLocked' => $kuesioner->isStructureLocked(),
            'questionTypes' => array_map(
                fn (QuestionType $type): array => ['value' => $type->value, 'label' => $type->label()],
                QuestionType::cases(),
            ),
            'metricKeys' => array_map(
                fn (MetricKey $key): array => [
                    'value' => $key->value,
                    'label' => $key->label(),
                    'question_type' => $key->questionType()->value,
                    'preset_options' => $key->presetOptions(),
                ],
                MetricKey::cases(),
            ),
            'newQuestionId' => session('new_question_id'),
        ]);
    }

    public function update(SaveKuesionerRequest $request, Kuesioner $kuesioner): RedirectResponse
    {
        $this->builder->update($kuesioner, $request->validated());

        return back()->with('status', 'Pengaturan kuesioner berhasil disimpan.');
    }

    public function destroy(Kuesioner $kuesioner): RedirectResponse
    {
        $this->builder->delete($kuesioner);

        return to_route('admin.kuesioner.index')->with('status', 'Kuesioner berhasil dihapus.');
    }

    public function duplicate(Kuesioner $kuesioner): RedirectResponse
    {
        $copy = $this->builder->duplicate($kuesioner);

        return to_route('admin.kuesioner.edit', $copy)
            ->with('status', 'Kuesioner berhasil diduplikasi sebagai draf baru.');
    }

    public function status(UpdateStatusRequest $request, Kuesioner $kuesioner): RedirectResponse
    {
        $target = KuesionerStatus::from($request->validated('status'));

        $this->builder->changeStatus($kuesioner, $target);

        return back()->with('status', "Status kuesioner diubah menjadi {$target->label()}.");
    }

    public function preview(Kuesioner $kuesioner): Response
    {
        return Inertia::render('Admin/Kuesioner/Preview', [
            'kuesioner' => $this->presenter->kuesioner($kuesioner),
            'sections' => $this->presenter->sections($kuesioner->pertanyaan()->get()),
        ]);
    }
}
