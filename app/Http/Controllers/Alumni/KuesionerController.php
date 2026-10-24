<?php

namespace App\Http\Controllers\Alumni;

use App\Http\Controllers\Controller;
use App\Http\Requests\Alumni\SaveKuesionerDraftRequest;
use App\Models\Kuesioner;
use App\Services\Alumni\PengisianKuesionerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KuesionerController extends Controller
{
    public function __construct(private PengisianKuesionerService $service) {}

    /**
     * Daftar kuesioner yang berlaku bagi alumni (KSN-10).
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Alumni/Kuesioner/Index', [
            'kuesionerList' => $this->service->listForAlumni($request->user()),
        ]);
    }

    /**
     * Halaman pengisian per bagian (KSN-11).
     */
    public function show(Request $request, Kuesioner $kuesioner): Response|RedirectResponse
    {
        if ($redirect = $this->denyUnlessAvailable($request, $kuesioner)) {
            return $redirect;
        }

        $respon = $this->service->startOrResume($request->user(), $kuesioner);
        $data = $this->service->pageData($kuesioner, $respon);
        $requested = $request->query('bagian');
        $lastIndex = max(count($data['sections']) - 1, 0);

        $currentSectionIndex = is_numeric($requested)
            ? min(max((int) $requested, 0), $lastIndex)
            : $this->service->sectionIndex($data['sections'], $respon->current_section);

        return Inertia::render('Alumni/Kuesioner/Show', [
            ...$data,
            'currentSectionIndex' => $currentSectionIndex,
            'userId' => $request->user()->id,
        ]);
    }

    /**
     * Simpan draf jawaban (JSON, dipakai autosave) (KSN-12).
     */
    public function draft(SaveKuesionerDraftRequest $request, Kuesioner $kuesioner): JsonResponse
    {
        $reason = $this->service->unavailableReason($request->user(), $kuesioner);

        if ($reason !== null) {
            return response()->json(['message' => $reason], 403);
        }

        $respon = $this->service->startOrResume($request->user(), $kuesioner);

        $respon = $this->service->saveDraft(
            $respon,
            $kuesioner,
            $request->string('section')->toString(),
            $request->input('answers', []) ?? [],
            $request->boolean('validate'),
        );

        return response()->json([
            'saved_at' => $respon->updated_at->toIso8601String(),
            'current_section' => $respon->current_section,
        ]);
    }

    /**
     * Ringkasan jawaban sebelum dikirim (KSN-13).
     */
    public function summary(Request $request, Kuesioner $kuesioner): Response|RedirectResponse
    {
        if ($redirect = $this->denyUnlessAvailable($request, $kuesioner)) {
            return $redirect;
        }

        $respon = $this->service->startOrResume($request->user(), $kuesioner);

        return Inertia::render('Alumni/Kuesioner/Summary', [
            ...$this->service->pageData($kuesioner, $respon),
            'incompleteSections' => $this->service->incompleteSections($kuesioner, $respon),
        ]);
    }

    /**
     * Kirim (atau kirim ulang setelah revisi) jawaban (KSN-14, KSN-15).
     */
    public function submit(Request $request, Kuesioner $kuesioner): RedirectResponse
    {
        if ($redirect = $this->denyUnlessAvailable($request, $kuesioner)) {
            return $redirect;
        }

        $respon = $this->service->startOrResume($request->user(), $kuesioner);
        $incomplete = $this->service->submit($respon, $kuesioner);

        if ($incomplete !== []) {
            $names = collect($incomplete)->pluck('name')->implode(', ');

            return to_route('alumni.kuesioner.summary', $kuesioner)
                ->with('error', "Masih ada pertanyaan yang belum lengkap pada bagian: {$names}.");
        }

        return to_route('alumni.kuesioner.done', $kuesioner);
    }

    /**
     * Halaman ucapan terima kasih setelah jawaban terkirim.
     */
    public function done(Request $request, Kuesioner $kuesioner): Response|RedirectResponse
    {
        if ($redirect = $this->denyUnlessAvailable($request, $kuesioner)) {
            return $redirect;
        }

        $respon = $this->service->startOrResume($request->user(), $kuesioner);

        if (! $respon->isSubmitted()) {
            return to_route('alumni.kuesioner.show', $kuesioner);
        }

        return Inertia::render('Alumni/Kuesioner/Done', [
            'kuesioner' => ['id' => $kuesioner->id, 'title' => $kuesioner->title, 'end_date' => $kuesioner->end_date->toDateString()],
            'submittedAt' => $respon->submitted_at?->toIso8601String(),
        ]);
    }

    /**
     * Alihkan ke daftar kuesioner dengan alasan bila alumni tidak boleh mengisi.
     */
    private function denyUnlessAvailable(Request $request, Kuesioner $kuesioner): ?RedirectResponse
    {
        $reason = $this->service->unavailableReason($request->user(), $kuesioner);

        return $reason === null ? null : to_route('alumni.kuesioner.index')->with('error', $reason);
    }
}
