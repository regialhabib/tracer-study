<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AlumniFilterRequest;
use App\Services\Admin\AlumniExportService;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AlumniExportController extends Controller
{
    public function __construct(private AlumniExportService $exportService) {}

    /**
     * Mengunduh daftar alumni (ikut filter aktif) sebagai .xlsx (ALM-08).
     */
    public function __invoke(AlumniFilterRequest $request): StreamedResponse
    {
        $filters = $request->filters();

        return response()->streamDownload(
            fn () => $this->exportService->stream($filters),
            $this->exportService->filename(),
            ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        );
    }
}
