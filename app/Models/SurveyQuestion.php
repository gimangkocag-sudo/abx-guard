<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SurveyQuestion extends Model
{
    protected $guarded = [];

    public function section(): BelongsTo
    {
        return $this->belongsTo(SurveySection::class, 'section_id');
    }
}
