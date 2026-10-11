<?php

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class EmailJsClient
{
    public function isConfigured(): bool
    {
        return filled(config('services.emailjs.service_id'))
            && filled(config('services.emailjs.template_id'))
            && filled(config('services.emailjs.public_key'))
            && filled(config('services.emailjs.private_key'));
    }

    /** @param array<string, string> $templateParams */
    public function send(string $recipient, array $templateParams): void
    {
        if (! $this->isConfigured()) {
            throw new RuntimeException('EmailJS is not configured.');
        }

        $response = Http::acceptJson()
            ->asJson()
            ->timeout((int) config('services.emailjs.timeout', 10))
            ->post(config('services.emailjs.endpoint'), [
                'service_id' => config('services.emailjs.service_id'),
                'template_id' => config('services.emailjs.template_id'),
                'user_id' => config('services.emailjs.public_key'),
                'accessToken' => config('services.emailjs.private_key'),
                'template_params' => [
                    ...$templateParams,
                    'to_email' => $recipient,
                ],
            ]);

        if (! $response->successful()) {
            throw new EmailJsDeliveryException($response->status(), $this->safeProviderMessage($response));
        }
    }

    private function safeProviderMessage(Response $response): string
    {
        $payload = $response->json();
        $message = is_array($payload)
            ? ($payload['message'] ?? $payload['error'] ?? $payload['text'] ?? '')
            : $response->body();

        if (! is_string($message)) {
            $message = '';
        }

        foreach ([
            config('services.emailjs.private_key'),
            config('services.emailjs.public_key'),
            config('services.emailjs.service_id'),
            config('services.emailjs.template_id'),
        ] as $sensitiveValue) {
            if (is_string($sensitiveValue) && $sensitiveValue !== '') {
                $message = str_replace($sensitiveValue, '[redacted]', $message);
            }
        }

        $message = preg_replace('/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i', '[email redacted]', $message) ?? '';
        $message = preg_replace('/[\x00-\x1F\x7F]/u', ' ', strip_tags($message)) ?? '';
        $message = trim(preg_replace('/\s+/', ' ', $message) ?? '');

        return $message !== '' ? mb_substr($message, 0, 240) : 'No safe provider message was returned.';
    }
}
