<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ResearchItem extends Model
{
    protected $guarded = [];

    protected $casts = ['options' => 'array', 'required' => 'boolean'];

    public function section(): BelongsTo
    {
        return $this->belongsTo(ResearchSection::class, 'section_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(ResearchAnswer::class, 'item_id');
    }
}
