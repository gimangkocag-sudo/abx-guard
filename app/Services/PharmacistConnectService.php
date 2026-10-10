<?php

namespace App\Services;

use App\Events\PharmacistMessageCreated;
use App\Models\PharmacistConversation;
use App\Models\PharmacistMessage;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PharmacistConnectService
{
    public function isOperational(): bool
    {
        return (bool) config('abx.pharmacist_connect.operational')
            && User::whereHas('pharmacistStaffMembership', fn ($query) => $query->where('active', true))->exists();
    }

    public function realtimeAvailable(): bool
    {
        return config('broadcasting.default') === 'reverb'
            && filled(config('broadcasting.connections.reverb.key'))
            && filled(config('broadcasting.connections.reverb.secret'))
            && filled(config('broadcasting.connections.reverb.app_id'))
            && filled(config('broadcasting.connections.reverb.options.host'))
            && filled(config('broadcasting.connections.reverb.options.port'))
            && filled(config('abx.pharmacist_connect.reverb_public_host'))
            && filled(config('abx.pharmacist_connect.reverb_public_key'))
            && ! empty(config('reverb.apps.apps.0.allowed_origins'));
    }

    public function realtimeConfiguration(): ?array
    {
        if (! $this->realtimeAvailable()) {
            return null;
        }

        return [
            'key' => config('abx.pharmacist_connect.reverb_public_key'),
            'host' => config('abx.pharmacist_connect.reverb_public_host'),
            'port' => (int) config('abx.pharmacist_connect.reverb_public_port', 443),
            'scheme' => config('abx.pharmacist_connect.reverb_public_scheme', 'https'),
        ];
    }

    public function send(PharmacistConversation $conversation, User $sender, string $body): PharmacistMessage
    {
        $message = DB::transaction(function () use ($conversation, $sender, $body) {
            $locked = PharmacistConversation::query()->lockForUpdate()->findOrFail($conversation->id);
            abort_if($locked->status === PharmacistConversation::STATUS_CLOSED, 409, 'Percakapan ini sudah ditutup.');

            $message = $locked->messages()->create([
                'sender_id' => $sender->id,
                'body' => trim($body),
            ]);

            $locked->forceFill([
                'status' => $sender->isActivePharmacistStaff()
                    ? PharmacistConversation::STATUS_WAITING
                    : PharmacistConversation::STATUS_OPEN,
                'last_activity_at' => now(),
            ])->save();

            return $message->load('sender:id,name');
        });

        $broadcastSent = false;
        try {
            if ($this->realtimeAvailable()) {
                event(new PharmacistMessageCreated($message));
                $broadcastSent = true;
            }
        } catch (\Throwable $exception) {
            // Never log message content or personal identifiers. Polling remains available.
            Log::warning('Pharmacist Connect broadcast failed; polling fallback remains active.', [
                'conversation_id' => $conversation->id,
                'exception' => $exception::class,
            ]);
        }

        $message->setAttribute('_realtime_sent', $broadcastSent);

        return $message;
    }

    public function serializeMessage(PharmacistMessage $message, int $viewerId): array
    {
        return [
            'id' => $message->id,
            'body' => $message->body,
            'sender_id' => $message->sender_id,
            'sender_name' => $message->sender?->name ?? 'Akun dihapus',
            'is_mine' => $message->sender_id === $viewerId,
            'created_at' => $message->created_at?->toIso8601String(),
            'recipient_read_at' => $message->recipient_read_at?->toIso8601String(),
        ];
    }
}
