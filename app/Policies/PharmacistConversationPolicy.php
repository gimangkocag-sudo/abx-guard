<?php

namespace App\Policies;

use App\Models\PharmacistConversation;
use App\Models\User;

class PharmacistConversationPolicy
{
    public function view(User $user, PharmacistConversation $conversation): bool
    {
        if ($conversation->user_id === $user->id) {
            return true;
        }

        return $user->isActivePharmacistStaff()
            && ($conversation->assigned_staff_id === null || $conversation->assigned_staff_id === $user->id);
    }

    public function send(User $user, PharmacistConversation $conversation): bool
    {
        if ($conversation->status === PharmacistConversation::STATUS_CLOSED) {
            return false;
        }

        if ($conversation->user_id === $user->id) {
            return true;
        }

        return $user->isActivePharmacistStaff()
            && $conversation->assigned_staff_id === $user->id;
    }

    public function claim(User $user, PharmacistConversation $conversation): bool
    {
        return $user->isActivePharmacistStaff()
            && $conversation->assigned_staff_id === null
            && $conversation->status !== PharmacistConversation::STATUS_CLOSED;
    }
}
