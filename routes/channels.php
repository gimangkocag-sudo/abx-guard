<?php

use App\Models\PharmacistConversation;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('pharmacist.conversations.{conversation}', function (User $user, int $conversation): bool {
    $model = PharmacistConversation::query()->find($conversation);

    if (! $model) {
        return false;
    }

    return $model->user_id === $user->id
        || ($user->isActivePharmacistStaff()
            && ($model->assigned_staff_id === null || $model->assigned_staff_id === $user->id));
});
