<?php

namespace App\Http\Controllers\Pesan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pesan\KontakFilterRequest;
use App\Http\Resources\KontakResource;
use App\Services\Pesan\KontakService;
use Inertia\Inertia;
use Inertia\Response;

class KontakController extends Controller
{
    public function __construct(private readonly KontakService $kontakService) {}

    public function index(KontakFilterRequest $request): Response
    {
        $filters = $request->validated();

        return Inertia::render('Pesan/Cari', [
            'contacts' => KontakResource::collection($this->kontakService->search($request->user(), $filters)),
            'filters' => [
                'q' => $filters['q'] ?? '',
                'angkatan' => $filters['angkatan'] ?? '',
                'peminatan' => $filters['peminatan'] ?? '',
            ],
            'filterOptions' => $this->kontakService->filterOptions(),
        ]);
    }
}
