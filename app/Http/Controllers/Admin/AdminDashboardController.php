<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AlumniProfile;
use App\Models\Berita;
use App\Models\Conversation;
use App\Models\JawabanKuesioner;
use App\Models\Kuesioner;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    /**
     * Menampilkan dashboard utama administrator.
     */
    public function index(): Response
    {
        $totalAlumni = User::where('role', 'alumni')->count();
        $totalResponses = JawabanKuesioner::distinct('user_id')->count('user_id');
        $totalBerita = Berita::count();
        $totalConversations = Conversation::count();

        $activeKuesioner = Kuesioner::withCount('pertanyaan')->where('is_active', true)->first();

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

        return Inertia::render('Admin/Dashboard', [
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
        ]);
    }
}
