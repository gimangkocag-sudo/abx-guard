<?php

namespace App\Services;

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
            // Do not expose provider response bodies: they may contain account data.
            throw new RuntimeException('EmailJS rejected the notification (HTTP '.$response->status().').');
        }
    }
}
