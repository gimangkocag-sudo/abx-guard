<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ResearchSection extends Model
{
    protected $guarded = [];

    public function instrument(): BelongsTo
    {
        return $this->belongsTo(ResearchInstrument::class, 'instrument_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ResearchItem::class, 'section_id')->orderBy('sort');
    }
}
