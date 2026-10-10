<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PharmacistConversation extends Model
{
    public const STATUS_OPEN = 'open';

    public const STATUS_WAITING = 'waiting';

    public const STATUS_CLOSED = 'closed';

    protected $fillable = ['user_id', 'assigned_staff_id', 'status', 'last_activity_at', 'closed_at'];

    protected function casts(): array
    {
        return ['last_activity_at' => 'datetime', 'closed_at' => 'datetime'];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function assignedStaff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_staff_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(PharmacistMessage::class, 'conversation_id');
    }

    public function latestMessage(): HasOne
    {
        return $this->hasOne(PharmacistMessage::class, 'conversation_id')->latestOfMany();
    }
}
