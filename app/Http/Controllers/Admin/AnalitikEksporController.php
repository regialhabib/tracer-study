<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\Analitik\AnalitikFilter;
use App\Services\Admin\Analitik\JawabanExportService;
use App\Services\Admin\Analitik\LaporanPdfService;
use App\Services\Admin\Analitik\NonRespondentExportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AnalitikEksporController extends Controller
{
    private const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    /**
     * Unduh jawaban mentah responden (.xlsx).
     */
    public function jawaban(Request $request, JawabanExportService $service): Response|RedirectResponse
    {
        $filter = AnalitikFilter::fromRequest($request);

        if ($filter->kuesioner === null) {
            return $this->tanpaKuesioner();
        }

        return response()->streamDownload(
            fn () => $service->stream($filter),
            $service->filename($filter),
            ['Content-Type' => self::XLSX_TYPE],
        );
    }

    /**
     * Unduh laporan ringkasan analitik (.pdf).
     */
    public function laporan(Request $request, LaporanPdfService $service): Response|RedirectResponse
    {
        $filter = AnalitikFilter::fromRequest($request);

        if ($filter->kuesioner === null) {
            return $this->tanpaKuesioner();
        }

        return response($service->render($filter), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$service->filename($filter).'"',
        ]);
    }

    /**
     * Unduh daftar alumni yang belum mengisi (.xlsx).
     */
    public function belumMengisi(Request $request, NonRespondentExportService $service): Response|RedirectResponse
    {
        $filter = AnalitikFilter::fromRequest($request);

        if ($filter->kuesioner === null) {
            return $this->tanpaKuesioner();
        }

        return response()->streamDownload(
            fn () => $service->stream($filter),
            $service->filename($filter),
            ['Content-Type' => self::XLSX_TYPE],
        );
    }

    private function tanpaKuesioner(): RedirectResponse
    {
        return back()->with('error', 'Belum ada kuesioner yang dapat diekspor.');
    }
}
