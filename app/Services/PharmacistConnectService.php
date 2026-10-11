<?php

namespace App\Services;

use App\Events\PharmacistMessageCreated;
use App\Models\PharmacistConversation;
use App\Models\PharmacistMessage;
use App\Models\User;
use App\Notifications\PharmacistNewMessageNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

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

        // Send after the message transaction commits and after realtime publication.
        // Delivery is synchronous because this deployment has no dedicated queue worker;
        // mail failure never rolls back chat or delays the initial broadcast.
        $senderRole = $sender->role ?? $sender->fresh()?->role;
        if ($senderRole === 'user' && ! $sender->isActivePharmacistStaff()) {
            $this->notifyActiveStaff($message);
        }

        $message->setAttribute('_realtime_sent', $broadcastSent);

        return $message;
    }

    private function notifyActiveStaff(PharmacistMessage $message): void
    {
        if (! $this->isOperational()) {
            return;
        }

        if (! app(EmailJsClient::class)->isConfigured()) {
            Log::notice('Pharmacist Connect email notification skipped because EmailJS is not configured.');

            return;
        }

        $inboxUrl = rtrim((string) config('app.url'), '/').'/pharmacist/inbox';
        $notification = new PharmacistNewMessageNotification($inboxUrl);
        $recipients = User::query()
            ->whereHas('pharmacistStaffMembership', fn ($query) => $query->where('active', true))
            ->whereNotNull('email')
            ->get(['id', 'email'])
            ->filter(fn (User $staff) => filter_var($staff->email, FILTER_VALIDATE_EMAIL) !== false);

        foreach ($recipients as $staff) {
            try {
                if ($staff !== $recipients->first()) {
                    // EmailJS documents a one-request-per-second REST API limit.
                    usleep(1_000_000);
                }

                Notification::send($staff, $notification);
            } catch (\Throwable $exception) {
                // Log only the provider's already-sanitized diagnostic fields when available.
                $context = [
                    'message_id' => $message->id,
                    'staff_user_id' => $staff->id,
                    'exception' => $exception::class,
                ];

                if ($exception instanceof EmailJsDeliveryException) {
                    $context['failure_category'] = 'provider_http_response';
                    $context['request_attempted'] = true;
                    $context['http_status'] = $exception->statusCode;
                    $context['provider_message'] = $exception->providerMessage;
                } elseif ($exception instanceof EmailJsTransportException) {
                    $context['failure_category'] = $exception->failureCategory;
                    $context['request_attempted'] = true;
                    $context['http_response_received'] = false;
                    $context['transport_exception'] = $exception->sourceExceptionClass;
                } elseif ($exception instanceof EmailJsRequestException) {
                    $context['failure_category'] = 'http_client_exception';
                    $context['request_attempted'] = true;
                    $context['http_response_received'] = false;
                    $context['client_exception'] = $exception->sourceExceptionClass;
                } else {
                    $context['failure_category'] = $this->applicationFailureCategory($exception);
                }

                Log::warning('Pharmacist Connect email notification delivery failed.', $context);
            }
        }
    }

    private function applicationFailureCategory(\Throwable $exception): string
    {
        $message = strtolower($exception->getMessage());

        return match (true) {
            str_contains($message, 'emailjs is not configured') => 'emailjs_configuration_missing',
            str_contains($message, 'driver [') && str_contains($message, 'not supported'),
            str_contains($message, 'not instantiable') => 'notification_channel_resolution',
            str_contains($message, 'invalid uri'),
            str_contains($message, 'malformed url') => 'http_request_setup',
            default => 'application_exception',
        };
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
