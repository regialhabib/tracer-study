<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\Analitik\AnalitikService;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function __construct(
        private AnalitikService $analitik,
    ) {}

    /**
     * Menampilkan dashboard utama administrator.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Dashboard', $this->analitik->dashboard());
    }
}
