<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\Analitik\AnalitikFilter;
use App\Services\Admin\Analitik\AnalitikService;
use App\Services\Kuesioner\KuesionerPresenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnalitikController extends Controller
{
    private const NON_RESPONDENT_PREVIEW = 50;

    public function __construct(
        private AnalitikService $analitik,
        private KuesionerPresenter $presenter,
    ) {}

    /**
     * Halaman analitik utama: ringkasan, grafik metrik, dan daftar alumni yang belum mengisi.
     */
    public function index(Request $request): Response
    {
        $filter = AnalitikFilter::fromRequest($request);
        $nonRespondents = $this->analitik->nonRespondents($filter);

        return Inertia::render('Admin/Analitik/Index', [
            ...$this->commonProps($filter),
            'summary' => $this->analitik->summary($filter),
            'responseRateByAngkatan' => $this->analitik->responseRateByAngkatan($filter),
            'statusDistribution' => $this->analitik->statusDistribution($filter),
            'masaTunggu' => $this->analitik->masaTunggu($filter),
            'pendapatan' => $this->analitik->pendapatan($filter),
            'topLembaga' => $this->analitik->topLembaga($filter),
            'relevansiIlmu' => $this->analitik->relevansiIlmu($filter),
            'nonRespondents' => [
                'total' => $nonRespondents->count(),
                'items' => $nonRespondents->take(self::NON_RESPONDENT_PREVIEW)->values()->all(),
            ],
        ]);
    }

    /**
     * Rekap jawaban per pertanyaan.
     */
    public function pertanyaan(Request $request): Response
    {
        $filter = AnalitikFilter::fromRequest($request);

        return Inertia::render('Admin/Analitik/Pertanyaan', [
            ...$this->commonProps($filter),
            'questions' => $this->analitik->questionRecap($filter),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function commonProps(AnalitikFilter $filter): array
    {
        return [
            'filters' => $filter->toArray(),
            'filterOptions' => $this->analitik->filterOptions(),
            'kuesioner' => $filter->kuesioner === null ? null : $this->presenter->kuesioner($filter->kuesioner),
        ];
    }
}
