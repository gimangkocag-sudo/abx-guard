<?php

namespace App\Services;

use App\Models\LearningProgress;
use App\Models\User;

class LearningProgressService
{
    public function record(User $user, string $module): void
    {
        LearningProgress::updateOrCreate(
            ['user_id' => $user->id, 'module' => $module],
            ['last_visited_at' => now()],
        );
    }

    public function summary(User $user): array
    {
        $visited = LearningProgress::where('user_id', $user->id)->pluck('module')->all();

        $items = collect(config('abx.modules'))->map(fn ($m, $slug) => [
            'slug' => $slug,
            'title' => $m['title'],
            'visited' => in_array($slug, $visited, true),
        ])->values();

        $done = $items->where('visited', true)->count();
        $total = $items->count();
        $next = $items->firstWhere('visited', false);

        return [
            'done' => $done,
            'total' => $total,
            'percent' => $total > 0 ? (int) round($done / $total * 100) : 0,
            'modules' => $items,
            'continue' => $next ? ['slug' => $next['slug'], 'title' => $next['title']] : null,
        ];
    }
}
