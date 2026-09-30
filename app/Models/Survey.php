<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Survey extends Model
{
    protected $guarded = [];

    protected $casts = ['is_active' => 'boolean'];

    public function sections(): HasMany
    {
        return $this->hasMany(SurveySection::class)->orderBy('sort');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(SurveySubmission::class);
    }
}
