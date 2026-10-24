<?php

namespace App\Http\Controllers\Pesan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pesan\KirimPesanRequest;
use App\Http\Resources\ConversationItemResource;
use App\Http\Resources\KontakResource;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\User;
use App\Services\Pesan\PesanPermission;
use App\Services\Pesan\PesanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PesanController extends Controller
{
    public function __construct(
        private PesanService $pesan,
        private PesanPermission $permission,
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('Pesan/Index', [
            'conversations' => $this->inboxFor($request),
            'filters' => ['q' => $this->searchTerm($request)],
        ]);
    }

    public function start(Request $request, User $user): RedirectResponse
    {
        $reason = $this->permission->denialReason($request->user(), $user);

        if ($reason !== null) {
            return back()->with('error', $reason);
        }

        $conversation = $this->pesan->startConversation($request->user(), $user);

        return redirect()->route('pesan.show', $conversation);
    }

    public function show(Request $request, Conversation $conversation): Response
    {
        $user = $request->user();
        $this->ensureParticipant($conversation, $user);

        $this->pesan->markAsRead($conversation, $user);

        $other = $conversation->otherParticipant($user)->load('profile');
        $history = $this->pesan->history($conversation);
        $reason = $this->permission->denialReason($user, $other);

        return Inertia::render('Pesan/Show', [
            'conversations' => $this->inboxFor($request),
            'filters' => ['q' => $this->searchTerm($request)],
            'conversation' => ['id' => $conversation->id],
            'other' => (new KontakResource($other))->resolve($request),
            'messages' => [
                'data' => MessageResource::collection($history['data'])->resolve($request),
                'has_more' => $history['has_more'],
            ],
            'canReply' => $reason === null,
            'replyBlockedReason' => $reason,
            'isBlockedByMe' => $user->hasBlocked($other),
            'canBlock' => $this->permission->canBlock($user, $other),
        ]);
    }

    public function history(Request $request, Conversation $conversation): JsonResponse
    {
        $this->ensureParticipant($conversation, $request->user());

        $before = $request->integer('before') ?: null;
        $history = $this->pesan->history($conversation, $before);

        return response()->json([
            'data' => MessageResource::collection($history['data'])->resolve($request),
            'has_more' => $history['has_more'],
        ]);
    }

    public function store(KirimPesanRequest $request, Conversation $conversation): JsonResponse
    {
        $user = $request->user();
        $this->ensureParticipant($conversation, $user);

        $reason = $this->permission->denialReason($user, $conversation->otherParticipant($user));

        if ($reason !== null) {
            return response()->json(['message' => $reason], 403);
        }

        $message = $this->pesan->send($conversation, $user, $request->validated('body'));

        return response()->json([
            'message' => (new MessageResource($message))->resolve($request),
        ], 201);
    }

    public function read(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $request->user();
        $this->ensureParticipant($conversation, $user);

        $this->pesan->markAsRead($conversation, $user);

        return response()->json(['unread_total' => $this->pesan->unreadTotal($user)]);
    }

    private function ensureParticipant(Conversation $conversation, User $user): void
    {
        abort_unless($conversation->hasParticipant($user), 403);
    }

    private function searchTerm(Request $request): string
    {
        return trim((string) $request->query('q', ''));
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function inboxFor(Request $request): array
    {
        return ConversationItemResource::collection(
            $this->pesan->inbox($request->user(), $this->searchTerm($request))
        )->resolve($request);
    }
}
