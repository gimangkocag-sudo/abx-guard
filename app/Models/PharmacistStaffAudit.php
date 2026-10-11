<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PharmacistStaffAudit extends Model
{
    public const ACTION_GRANTED = 'granted';

    public const ACTION_REVOKED = 'revoked';

    public $timestamps = false;

    protected $fillable = [
        'actor_user_id',
        'target_user_id',
        'action',
        'was_active',
        'is_active',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'was_active' => 'boolean',
            'is_active' => 'boolean',
            'created_at' => 'datetime',
        ];
    }
}
