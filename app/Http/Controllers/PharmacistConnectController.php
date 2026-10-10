<?php

namespace App\Http\Controllers;

use App\Http\Requests\Pharmacist\StoreMessageRequest;
use App\Models\PharmacistConversation;
use App\Models\PharmacistMessage;
use App\Services\PharmacistConnectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PharmacistConnectController extends Controller
{
    public function __construct(private readonly PharmacistConnectService $service) {}

    public function index(Request $request): JsonResponse
    {
        $conversations = PharmacistConversation::query()
            ->where('user_id', $request->user()->id)
            ->withCount('messages')
            ->orderByDesc('last_activity_at')
            ->get(['id', 'status', 'last_activity_at', 'created_at']);

        return response()->json([
            'conversations' => $conversations,
            'operational' => $this->service->isOperational(),
            'realtime' => $this->service->realtimeAvailable(),
            'realtime_config' => $this->service->realtimeConfiguration(),
            'poll_interval_ms' => max(5000, min(30000, (int) config('abx.pharmacist_connect.poll_interval_ms', 10000))),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        abort_unless($this->service->isOperational(), 503, 'Layanan pesan apoteker belum tersedia.');

        $conversation = $request->user()->pharmacistConversations()->create([
            'status' => PharmacistConversation::STATUS_OPEN,
        ]);

        return response()->json(['conversation' => $conversation], 201);
    }

    public function show(Request $request, PharmacistConversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);

        $afterId = max(0, (int) $request->query('after_id', 0));
        $query = $conversation->messages()->with('sender:id,name')->where('id', '>', $afterId);
        $messages = $afterId === 0
            ? $query->latest('id')->limit(100)->get()->reverse()->values()
            : $query->orderBy('id')->limit(100)->get();

        if ($messages->isNotEmpty()) {
            $conversation->messages()
                ->whereIn('id', $messages->pluck('id'))
                ->where('sender_id', '!=', $request->user()->id)
                ->whereNull('recipient_read_at')
                ->update(['recipient_read_at' => now()]);
        }

        return response()->json([
            'conversation' => $conversation->only(['id', 'status', 'last_activity_at', 'closed_at']),
            'messages' => $messages->map(fn (PharmacistMessage $message) => $this->service->serializeMessage($message, $request->user()->id)),
            'realtime' => $this->service->realtimeAvailable(),
            'operational' => $this->service->isOperational(),
            'poll_interval_ms' => max(5000, min(30000, (int) config('abx.pharmacist_connect.poll_interval_ms', 10000))),
            'realtime_config' => $this->service->realtimeConfiguration(),
        ]);
    }

    public function send(StoreMessageRequest $request, PharmacistConversation $conversation): JsonResponse
    {
        $this->authorize('send', $conversation);
        abort_unless($this->service->isOperational(), 503, 'Layanan pesan apoteker belum tersedia.');

        $message = $this->service->send($conversation, $request->user(), $request->validated('body'));

        return response()->json([
            'message' => $this->service->serializeMessage($message, $request->user()->id),
            'realtime' => (bool) $message->getAttribute('_realtime_sent'),
            'realtime_config' => $this->service->realtimeConfiguration(),
        ], 201);
    }

    public function inbox(): JsonResponse
    {
        $userId = request()->user()->id;
        $conversations = PharmacistConversation::query()
            ->where(fn ($query) => $query->whereNull('assigned_staff_id')->orWhere('assigned_staff_id', $userId))
            ->with(['owner:id,name', 'latestMessage'])
            ->orderByRaw('CASE WHEN assigned_staff_id IS NULL THEN 0 ELSE 1 END')
            ->orderByDesc('last_activity_at')
            ->paginate(30)
            ->through(fn (PharmacistConversation $conversation) => [
                'id' => $conversation->id,
                'owner_name' => $conversation->owner?->name ?? 'Akun dihapus',
                'status' => $conversation->status,
                'assigned_to_me' => $conversation->assigned_staff_id === $userId,
                'last_activity_at' => $conversation->last_activity_at?->toIso8601String(),
                'last_message' => $conversation->latestMessage?->only(['id', 'body', 'sender_id', 'created_at']),
            ]);

        return response()->json([
            'data' => $conversations,
            'operational' => $this->service->isOperational(),
            'realtime' => $this->service->realtimeAvailable(),
            'realtime_config' => $this->service->realtimeConfiguration(),
            'poll_interval_ms' => max(5000, min(30000, (int) config('abx.pharmacist_connect.poll_interval_ms', 10000))),
        ]);
    }

    public function claim(Request $request, PharmacistConversation $conversation): JsonResponse
    {
        $this->authorize('claim', $conversation);

        $claimed = DB::transaction(function () use ($request, $conversation) {
            $locked = PharmacistConversation::query()->lockForUpdate()->findOrFail($conversation->id);
            abort_unless($locked->assigned_staff_id === null, 409, 'Percakapan sudah ditangani petugas lain.');
            abort_if($locked->status === PharmacistConversation::STATUS_CLOSED, 409, 'Percakapan yang ditutup tidak dapat diambil.');
            $locked->forceFill(['assigned_staff_id' => $request->user()->id])->save();

            return $locked;
        });

        return response()->json(['conversation' => $claimed->only(['id', 'status', 'assigned_staff_id'])]);
    }

    public function updateStatus(Request $request, PharmacistConversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);
        abort_unless($request->user()->isActivePharmacistStaff() && $conversation->assigned_staff_id === $request->user()->id, 403);
        $data = $request->validate(['status' => ['required', 'in:open,waiting,closed']]);

        $conversation->forceFill([
            'status' => $data['status'],
            'closed_at' => $data['status'] === PharmacistConversation::STATUS_CLOSED ? now() : null,
        ])->save();

        return response()->json(['conversation' => $conversation->only(['id', 'status', 'closed_at'])]);
    }
}
