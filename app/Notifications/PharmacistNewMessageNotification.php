<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PharmacistNewMessageNotification extends Notification
{
    public function __construct(public readonly string $inboxUrl) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Pesan baru di Pharmacist Connect — ABX Guard')
            ->greeting('Ada pesan baru untuk ditinjau')
            ->line('Ada pesan baru yang menunggu respons di Pharmacist Connect ABX Guard.')
            ->line('Silakan masuk ke website untuk membaca dan membalas pesan melalui inbox yang telah diotorisasi.')
            ->action('Buka Inbox ABX Guard', $this->inboxUrl);
    }
}
