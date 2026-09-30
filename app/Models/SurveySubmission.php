<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SurveySubmission extends Model
{
    protected $guarded = [];

    protected $casts = ['submitted_at' => 'datetime'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function survey(): BelongsTo
    {
        return $this->belongsTo(Survey::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(SurveyAnswer::class, 'submission_id');
    }

    /**
     * Filter admin bersama (daftar, statistik, export).
     * Keys: survey_id (int), from/to (Carbon), q (nama/email user atau ID submission). Semua nilai di-bind.
     */
    public function scopeFiltered(Builder $query, array $f): Builder
    {
        return $query
            ->when($f['survey_id'] ?? null, fn ($q, $id) => $q->where('survey_id', $id))
            ->when($f['from'] ?? null, fn ($q, $d) => $q->where('submitted_at', '>=', $d))
            ->when($f['to'] ?? null, fn ($q, $d) => $q->where('submitted_at', '<=', $d))
            ->when($f['q'] ?? null, function ($q, $term) {
                $like = '%'.$term.'%';
                $q->where(function ($w) use ($term, $like) {
                    $w->whereHas('user', fn ($u) => $u->where('name', 'like', $like)->orWhere('email', 'like', $like));
                    if (ctype_digit($term)) {
                        $w->orWhere('id', (int) $term);
                    }
                });
            });
    }
}
