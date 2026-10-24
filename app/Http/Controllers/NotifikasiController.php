<?php

namespace App\Http\Controllers;

use App\Services\Notifikasi\NotifikasiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotifikasiController extends Controller
{
    public function __construct(private NotifikasiService $notifikasiService) {}

    /**
     * Halaman penuh notifikasi, terbaru dahulu.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Notifikasi/Index', [
            'notifications' => $this->notifikasiService->paginate($request->user()),
        ]);
    }

    /**
     * Delapan notifikasi terbaru untuk dropdown lonceng.
     */
    public function recent(Request $request): JsonResponse
    {
        return response()->json([
            'items' => $this->notifikasiService->recent($request->user()),
            'unread' => $this->notifikasiService->unreadCount($request->user()),
        ]);
    }

    /**
     * Tandai satu notifikasi terbaca lalu arahkan ke tautannya (atau kembali bila `?back=1`).
     */
    public function markAsRead(Request $request, string $notification): RedirectResponse
    {
        $record = $this->notifikasiService->markAsRead($request->user(), $notification);

        abort_if($record === null, 404);

        $url = $record->data['url'] ?? null;

        if ($request->boolean('back') || ! is_string($url) || $url === '') {
            return back();
        }

        return redirect()->to($url);
    }

    public function markAllAsRead(Request $request): RedirectResponse
    {
        $this->notifikasiService->markAllAsRead($request->user());

        return back();
    }
}
