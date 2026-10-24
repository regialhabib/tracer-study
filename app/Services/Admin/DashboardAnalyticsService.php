<?php

namespace App\Services\Admin;

use App\Enums\ResponStatus;
use App\Models\AlumniProfile;
use App\Models\Berita;
use App\Models\Conversation;
use App\Models\Kuesioner;
use App\Models\ResponKuesioner;
use App\Models\User;

class DashboardAnalyticsService
{
    /**
     * Mengagregasi metrik dan data analitik untuk halaman dashboard administrator.
     *
     * @return array{stats: array<string, mixed>, activeKuesioner: ?Kuesioner, recentAlumni: mixed, statusBreakdown: array<string, int>}
     */
    public function getDashboardMetrics(): array
    {
        $totalAlumni = User::where('role', 'alumni')->count();
        $totalResponses = ResponKuesioner::where('status', ResponStatus::Submitted->value)->distinct('user_id')->count('user_id');
        $totalBerita = Berita::count();
        $totalConversations = Conversation::count();

        $activeKuesioner = Kuesioner::withCount('pertanyaan')->active()->orderBy('end_date')->first();

        $recentAlumni = User::with('profile')
            ->where('role', 'alumni')
            ->latest()
            ->take(6)
            ->get();

        $statusBreakdown = AlumniProfile::query()
            ->selectRaw('current_status, count(*) as count')
            ->groupBy('current_status')
            ->pluck('count', 'current_status')
            ->toArray();

        return [
            'stats' => [
                'total_alumni' => $totalAlumni,
                'total_responses' => $totalResponses,
                'total_berita' => $totalBerita,
                'total_conversations' => $totalConversations,
                'response_rate' => $totalAlumni > 0 ? round(($totalResponses / $totalAlumni) * 100, 1) : 0,
            ],
            'activeKuesioner' => $activeKuesioner,
            'recentAlumni' => $recentAlumni,
            'statusBreakdown' => $statusBreakdown,
        ];
    }
}
