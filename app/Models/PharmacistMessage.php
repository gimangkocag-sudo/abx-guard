<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PharmacistMessage extends Model
{
    protected $fillable = ['conversation_id', 'sender_id', 'body', 'recipient_read_at'];

    protected function casts(): array
    {
        return [
            'body' => 'encrypted',
            'recipient_read_at' => 'datetime',
        ];
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(PharmacistConversation::class, 'conversation_id');
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
