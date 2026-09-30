<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChallengeAnswer extends Model
{
    protected $guarded = [];

    protected $casts = ['is_correct' => 'boolean'];

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(ChallengeAttempt::class, 'attempt_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(ChallengeQuestion::class, 'challenge_question_id');
    }
}
