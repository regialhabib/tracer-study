<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ConfirmAlumniImportRequest;
use App\Http\Requests\Admin\UploadAlumniImportRequest;
use App\Services\Admin\AlumniImportService;
use App\Services\Admin\AlumniImportTemplateService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ImportAlumniController extends Controller
{
    public function __construct(
        private AlumniImportService $importService,
        private AlumniImportTemplateService $templateService,
    ) {}

    /**
     * Halaman stepper import (langkah Unggah).
     */
    public function create(): Response
    {
        return $this->page('upload');
    }

    /**
     * Mengunduh templat Excel import alumni.
     */
    public function template(): BinaryFileResponse
    {
        return response()
            ->download($this->templateService->build(), 'templat-import-alumni.xlsx')
            ->deleteFileAfterSend();
    }

    /**
     * Membaca berkas unggahan dan menampilkan pratinjau hasil validasi per baris.
     */
    public function preview(UploadAlumniImportRequest $request): Response
    {
        $preview = $this->importService->preview($request->file('file'), $request->user());

        return $this->page('preview', ['preview' => $preview]);
    }

    /**
     * Menyimpan baris valid dari pratinjau dalam satu transaksi.
     */
    public function store(ConfirmAlumniImportRequest $request): Response
    {
        $result = $this->importService->confirm($request->validated('token'), $request->user());

        return $this->page('result', ['result' => $result]);
    }

    /**
     * Mengunduh laporan hasil import dalam format xlsx.
     */
    public function report(Request $request, string $token): BinaryFileResponse
    {
        $path = $this->importService->buildReport($token, $request->user());

        return response()->download($path, 'laporan-import-alumni.xlsx')->deleteFileAfterSend();
    }

    /**
     * @param  array<string, mixed>  $props
     */
    private function page(string $step, array $props = []): Response
    {
        return Inertia::render('Admin/Alumni/Import', [
            'step' => $step,
            'preview' => null,
            'result' => null,
            'limits' => [
                'maxRows' => AlumniImportService::MAX_ROWS,
                'maxSizeMb' => 5,
            ],
            ...$props,
        ]);
    }
}
