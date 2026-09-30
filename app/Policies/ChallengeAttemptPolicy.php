<?php

namespace App\Policies;

use App\Models\ChallengeAttempt;
use App\Models\User;

class ChallengeAttemptPolicy
{
    /** User hanya boleh melihat hasil miliknya sendiri. */
    public function view(User $user, ChallengeAttempt $attempt): bool
    {
        return $attempt->user_id === $user->id;
    }
}
