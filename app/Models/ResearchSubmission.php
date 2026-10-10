<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ResearchSubmission extends Model
{
    protected $guarded = [];

    protected $casts = ['started_at' => 'datetime', 'submitted_at' => 'datetime', 'evaluation_unlocked_at' => 'datetime'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function instrument(): BelongsTo
    {
        return $this->belongsTo(ResearchInstrument::class, 'instrument_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(ResearchAnswer::class, 'submission_id');
    }

    public function scopeFiltered(Builder $query, array $filters): Builder
    {
        return $query
            ->when($filters['stage'] ?? null, fn ($q, $stage) => $q->where('stage', $stage))
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->when($filters['from'] ?? null, fn ($q, $date) => $q->whereDate('submitted_at', '>=', $date))
            ->when($filters['to'] ?? null, fn ($q, $date) => $q->whereDate('submitted_at', '<=', $date))
            ->when($filters['q'] ?? null, function ($q, $term) {
                $like = '%'.$term.'%';
                $q->where(function ($where) use ($term, $like) {
                    $where->whereHas('user', fn ($user) => $user->where('name', 'like', $like)->orWhere('email', 'like', $like));
                    if (ctype_digit($term)) $where->orWhere('id', (int) $term);
                });
            });
    }
}
