<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ResearchInstrument extends Model
{
    protected $guarded = [];

    protected $casts = ['is_active' => 'boolean'];

    public function sections(): HasMany
    {
        return $this->hasMany(ResearchSection::class, 'instrument_id')->orderBy('sort');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(ResearchSubmission::class, 'instrument_id');
    }
}
