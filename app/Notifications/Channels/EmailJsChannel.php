<?php

namespace App\Notifications\Channels;

use App\Services\EmailJsClient;
use Illuminate\Notifications\Notification;

class EmailJsChannel
{
    public function __construct(private readonly EmailJsClient $client) {}

    public function send(object $notifiable, Notification $notification): void
    {
        if (! method_exists($notification, 'toEmailJs')) {
            return;
        }

        // Laravel's built-in email address routing key is `mail`; `email` returns null.
        $recipient = $notifiable->routeNotificationFor('mail', $notification);
        if (! is_string($recipient) || filter_var($recipient, FILTER_VALIDATE_EMAIL) === false) {
            return;
        }

        $this->client->send($recipient, $notification->toEmailJs($notifiable));
    }
}
