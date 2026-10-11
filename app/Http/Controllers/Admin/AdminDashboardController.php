<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\DashboardAnalyticsService;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    /**
     * Injeksi dependensi DashboardAnalyticsService.
     */
    public function __construct(
        private DashboardAnalyticsService $analyticsService
    ) {}

    /**
     * Menampilkan dashboard utama administrator via service.
     */
    public function index(): Response
    {
        $metrics = $this->analyticsService->getDashboardMetrics();

        return Inertia::render('Admin/Dashboard', $metrics);
    }
}
